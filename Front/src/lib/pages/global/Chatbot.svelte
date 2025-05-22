<script>
    import { onMount } from 'svelte';
    import FaGooglePlay from 'svelte-icons/fa/FaGooglePlay.svelte'
    import FaHeadset from 'svelte-icons/fa/FaHeadset.svelte';
    import { pathChatbotMS } from '../../../stores/host';
    import { user } from '../../../stores/auth.store';
    import { carrito } from '../../../stores/carrito';
    
    let isOpen = false;
    let isDraggingWindow = false;
    let windowPosition = { x: 0, y: 0 };
    let startDragPosition = { x: 0, y: 0 };
    let message = '';
    let isTyping = false;
    let messages = [];
    const chatWindowWidth = 300;
    const chatWindowHeight = 500;
    const margin = 20;
    const bubbleSize = 60;
    
    let chatContentElement;
    
    const bubblePosition = {
        get x() { return window.innerWidth - bubbleSize - margin; },
        get y() { return window.innerHeight - bubbleSize - margin; }
    };
    
    const scrollToBottom = () => {
        if (chatContentElement) {
            chatContentElement.scrollTop = chatContentElement.scrollHeight;
        }
    };
    
    const calculateWindowPosition = () => {
        windowPosition = {
            x: bubblePosition.x + bubbleSize - chatWindowWidth,
            y: bubblePosition.y + bubbleSize - chatWindowHeight
        };
        
        adjustWindowPosition();
    };
    
    const adjustWindowPosition = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (windowPosition.x < margin) {
            windowPosition.x = margin;
        } else if (windowPosition.x + chatWindowWidth > viewportWidth - margin) {
            windowPosition.x = viewportWidth - chatWindowWidth - margin;
        }
        
        if (windowPosition.y < margin) {
            windowPosition.y = margin;
        } else if (windowPosition.y + chatWindowHeight > viewportHeight - margin) {
            windowPosition.y = viewportHeight - chatWindowHeight - margin;
        }
    };
    
    const toggleChat = () => {
        isOpen = !isOpen;
        if (isOpen) calculateWindowPosition();
    };
    
    const startWindowDrag = (e) => {
        isDraggingWindow = true;
        startDragPosition = {
            x: e.clientX - windowPosition.x,
            y: e.clientY - windowPosition.y
        };
        e.preventDefault();
    };
    
    const handleWindowDrag = (e) => {
        if (!isDraggingWindow) return;
        windowPosition = {
            x: e.clientX - startDragPosition.x,
            y: e.clientY - startDragPosition.y
        };
    };
    
    const endWindowDrag = () => {
        if (isDraggingWindow) {
            isDraggingWindow = false;
            adjustWindowPosition();
            localStorage.setItem('chatbotWindowPosition', JSON.stringify(windowPosition));
        }
    };
    
    const sendMessage = async () => {
        if (!message.trim()) return;
        
        const userMessage = { message: message, sender: 'user' };
        messages = [...messages, userMessage];
        
        const currentMessage = message;
        message = '';
        
        setTimeout(scrollToBottom, 0);
        
        isTyping = true;
        messages = [...messages, { message: 'Escribiendo...', sender: 'typing', id: 'typing-indicator' }];
        setTimeout(scrollToBottom, 0);
        
        try {
            const response = await fetchBotResponse(currentMessage);
            
            messages = messages.filter(msg => msg.id !== 'typing-indicator');
            
            messages = [...messages, { message: response.message, sender: 'bot' }];
            if(response.producto) carrito.agregarProducto(response.producto, response.cantidad)
            setTimeout(scrollToBottom, 0);
        } catch (error) {
            messages = messages.filter(msg => msg.id !== 'typing-indicator');
            
            messages = [...messages, { 
                message: 'Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo más tarde.', 
                sender: 'bot', 
                isError: true 
            }];
            console.error('Error al recibir respuesta:', error);
        } finally {
            isTyping = false;
            setTimeout(scrollToBottom, 0);
        }
    };

    const fetchBotResponse = async (message) => { 
        try {
            const response = await fetch(`${pathChatbotMS}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({
                    message: message,
                    userId: $user.id_usuario,
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error en la comunicación con el backend:', error);
            throw error;
        }
        
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    const fetchMessagesFromBackend = async () => {
        try {
            const response = await fetch(`${pathChatbotMS}/chat`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
            });
            
            if (!response.ok) {
                throw new Error(`Error al cargar mensajes: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al cargar mensajes del backend:', error);
            throw error;
        }
        
    };

    onMount(async () => {
        messages = [{ message: "Cargando conversación...", sender: "system", id: "loading-indicator" }];
        
        try {
            const savedWindowPos = localStorage.getItem('chatbotWindowPosition');
            if (savedWindowPos) windowPosition = JSON.parse(savedWindowPos);
            
            calculateWindowPosition();
            
            const response = await fetchMessagesFromBackend();
            
            if (response && response.data) {
                messages = response.data;
            } else {
                messages = [{ 
                    message: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?", 
                    sender: "bot" 
                }];
            }
            
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error al inicializar el chat:', error);
            messages = [{ 
                message: "Lo siento, no pude cargar la conversación anterior. Por favor, refresca la página o inténtalo más tarde.", 
                sender: "system", 
                isError: true 
            }];
        }
    });
</script>

<svelte:window 
    onmousemove={handleWindowDrag}
    onmouseup={endWindowDrag}
/>

{#if !isOpen}
    <div 
        class="chatbot-bubble"
        style="right: {margin}px; bottom: {margin}px"
        onclick={toggleChat}
        onkeydown={(e) => e.key === 'Enter' && toggleChat()}
        role="button"
        tabindex="0"
        aria-label="Abrir chat"
    >
        <FaHeadset />
    </div>
{/if}

{#if isOpen}
    <div 
        class="chatbot-window"
        style="left: {windowPosition.x}px; top: {windowPosition.y}px;
               width: {chatWindowWidth}px; height: {chatWindowHeight}px"
    >
        <div 
            class="chatbot-header" 
            onmousedown={startWindowDrag}
            onkeydown={(e) => e.key === 'Enter' && toggleChat()}
            role="button"
            tabindex="0"
            aria-label="chatbot"
        >
            Asistente Virtual
            <button class="close-btn" onclick={toggleChat}>×</button>
        </div>
        
        <div class="chatbot-content" bind:this={chatContentElement}>
            {#each messages as msg}
                <div class="message {msg.sender}">
                    {@html msg.message.replace(/\n/g, '<br>')}
                </div>
            {/each}
        </div>
        
        <div class="chatbot-input">
            <input 
                type="text" 
                placeholder="Escribe tu mensaje..." 
                bind:value={message}
                onkeypress={handleKeyPress}
            />
            <button onclick={sendMessage}><FaGooglePlay /></button>
        </div>
    </div>
{/if}

<style>
    .chatbot-bubble {
        position: fixed;
        width: 60px;
        height: 60px;
        background: #4285f4;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        user-select: none;
        transition: transform 0.2s;
    }

    .chatbot-bubble :global(svg) {
        width: 2rem;
    }
  
    .chatbot-bubble:hover {
        transform: scale(1.1);
    }
  
    .chatbot-window {
        position: fixed;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        z-index: 1001;
        overflow: hidden;
    }
  
    .chatbot-header {
        padding: 15px;
        background: #4285f4;
        color: white;
        font-weight: bold;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
    }
  
    .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0 5px;
    }
  
    .chatbot-content {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        background: #f9f9f9;
    }
  
    .message {
        margin-bottom: 10px;
        padding: 8px 12px;
        border-radius: 18px;
        max-width: 80%;
        word-wrap: break-word;
    }
  
    .message.user {
        background: #4285f4;
        color: white;
        margin-left: auto;
        border-bottom-right-radius: 4px;
    }
  
    .message.bot {
        background: #e5e5ea;
        color: black;
        margin-right: auto;
        border-bottom-left-radius: 4px;
    }
  
    .chatbot-input {
        display: flex;
        padding: 10px;
        border-top: 1px solid #eee;
        background: white;
    }
  
    .chatbot-input input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 20px;
        margin-right: 8px;
        outline: none;
    }
  
    .chatbot-input button {
        padding: 10px;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .chatbot-input :global(svg) {
        width: 1.3rem;
    }

    .message.system {
        background: #f1f1f1;
        color: #666;
        text-align: center;
        margin: 10px auto;
        font-style: italic;
        padding: 8px 16px;
        border-radius: 12px;
        max-width: 90%;
    }
  
    .chatbot-input button:hover {
        background: #3367d6;
    }
</style>