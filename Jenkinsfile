// en esto deberemos tener node globalmente
/*
sudo su
cd /usr/local/src
sudo curl -O https://nodejs.org/dist/v23.11.0/node-v23.11.0-linux-x64.tar.xz
sudo tar -xf node-v23.11.0-linux-x64.tar.xz
sudo mv node-v23.11.0-linux-x64 /usr/local/nodejs
echo 'export PATH=/usr/local/nodejs/bin:$PATH' | sudo tee /etc/profile.d/nodejs.sh
source /etc/profile.d/nodejs.sh

sudo /usr/local/nodejs/bin/npm install -g pm2
/usr/local/nodejs/bin/pm2 -v
pm2 startup systemd
sudo env PATH=$PATH:/usr/local/bin pm2 startup systemd -u jenkins --hp /var/lib/jenkins

sudo su - jenkins
export PATH=/usr/local/nodejs/bin:$PATH
pm2 save

exit
exit

sudo su // Caso superusuario
sudo su - jenkins // En caso de ir al usuario de jenkins
*/

pipeline {
    agent any
    environment {
        GITHUB_TOKEN = credentials('github-credentials-token')
    }
    stages {
        stage('Deploy Frontend') {
            steps {
                dir('Front') {
                    sh '''
                        # Aseguramos que Jenkins vea Node y PM2
                        export PATH=/usr/local/nodejs/bin:/usr/local/bin:$PATH
                        export HOME=/var/lib/jenkins

                        echo "[+] Actualizando código..."
                        git pull https://$GITHUB_TOKEN@github.com/Iskandar1412/ProyectoSA-B-11.git develop
                        git pull https://$GITHUB_TOKEN@github.com/Iskandar1412/ProyectoSA-B-11.git main

                        echo "[+] Instalando dependencias..."
                        npm install

                        echo "[+] Deteniendo instancia anterior de frontend (si existe)..."
                        pm2 delete frontend || true

                        echo "[+] Iniciando frontend con PM2..."
                        pm2 start "npm run dev -- --host" --name frontend

                        echo "[+] Guardando configuración de PM2 (opcional, si hiciste pm2 startup)..."
                        pm2 save

                        echo "[+] Estado actual de PM2:"
                        pm2 status
                    '''
                }
            }
        }
    }
}
