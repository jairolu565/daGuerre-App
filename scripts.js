const AWS = require('aws-sdk');

// Configure AWS credentials
AWS.config.update({
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  region: 'YOUR_REGION'
});

// Create an S3 instance
const s3 = new AWS.S3();

// Generate a pre-signed URL for the credentials.json file
const params = {
  Bucket: 'YOUR_BUCKET_NAME',
  Key: 'credentials.json',
  Expires: 3600 // URL expiration time in seconds
};

const preSignedUrl = s3.getSignedUrl('getObject', params);

console.log('Pre-signed URL:', preSignedUrl);


const credentialsUrl = 'https://example.com/credentials.json'; // Replace with the pre-signed URL

// Função para carregar as credenciais do arquivo JSON usando uma URL pré-assinada
async function loadCredentials() {
  try {
    const response = await fetch(credentialsUrl);
    const credentials = await response.json();
    return credentials;
  } catch (error) {
    console.error('Erro ao carregar as credenciais do arquivo JSON:', error);
    return null;
  }
}

// Função para configurar as credenciais do SDK da AWS
async function configureAWSCredentials() {
  const credentials = await loadCredentials();

  if (credentials) {
    AWS.config.update({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      region: credentials.region
    });
  } else {
    console.error('Falha ao configurar as credenciais do SDK da AWS.');
  }
}

// Função para gerar credenciais temporárias
async function getTemporaryCredentials() {
  const sts = new AWS.STS();

  try {
    const data = await sts.getCallerIdentity().promise();

    return {
      accessKeyId: AWS.config.credentials.accessKeyId,
      secretAccessKey: AWS.config.credentials.secretAccessKey,
      sessionToken: AWS.config.credentials.sessionToken,
    };
  } catch (error) {
    throw error;
  }
}

// Chama a função para configurar as credenciais antes de outras operações
configureAWSCredentials();

function hideTokenInput() {
  const tokenInput = document.getElementById('tokenInput');
  tokenInput.style.display = 'none';
  //hide the button
  const submitButton = document.getElementById('go');
  submitButton.style.display = 'none';
}

async function validate(token) {
  try {
    currentToken = token;
    const credentials = await getTemporaryCredentials();
    const s3 = new AWS.S3({
        credentials: credentials,
        region: 'sa-east-1', 
    });
  }
  catch (error) {
    console.error('Erro ao validar as credenciais', error);
  }
  //verifica se existe a pasta com o nome do token
  const s3 = new AWS.S3();
  const params = {
    Bucket: 'qphotos',
    Prefix: token
  };
  try {
    const data = await s3.listObjectsV2(params).promise();
    if (data.Contents.length > 0) {
      hideTokenInput();
      addPhotosToGallery(token);
      confirmbutt();
      return true;
    }
    else {
      return false;
    }
  } catch (error) {
    console.error('Erro ao validar o token:', error);
  }
}

// Função para carregar links do arquivo JSON
async function loadLinks(token) {
  try {
    const response = await fetch(`./${token}/links.json`);
    const links = await response.json();
    return links;
  } catch (error) {
    console.error('Erro ao carregar links do arquivo JSON:', error);
    return [];
  }
}

// Função para adicionar fotos ao gallery
async function addPhotosToGallery(token) {
    const photoLinks = await loadLinks(token);
    const gallery = document.getElementById('gallery');

    photoLinks.forEach((link, index) => {
        const photoContainer = document.createElement('a');
        photoContainer.href = link;
        photoContainer.setAttribute('data-lightbox', 'gallery');
        photoContainer.setAttribute('data-title', `Foto ${index + 1}`);
        photoContainer.className = 'photo';

        const img = document.createElement('img');
        img.src = link;
        img.referrerPolicy = 'no-referrer';
        img.alt = `Foto ${index + 1}`;

        const likeButton = document.createElement('button');
        likeButton.className = 'like-button';
        likeButton.innerHTML = 'Select';

        likeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            likeButton.innerHTML = 'Selected';
            event.preventDefault(); // Impede que o link seja aberto
            selectedPhotos[index] = link;
        });

        photoContainer.appendChild(img);
        photoContainer.appendChild(likeButton);

        gallery.appendChild(photoContainer);
    });

     // Adiciona uma quebra de linha entre cada link no arquivo JSON
     const jsonContent = photoLinks.map(link => JSON.stringify(link)).join(',\n');
}

// Adicione um botão para confirmar a seleção
const confirmButton = document.createElement('button');
confirmButton.innerHTML = 'Confirm selection';
let selectedPhotos = {};
confirmButton.addEventListener('click', async () => {
    // Mostrar as fotos selecionadas
    alert('Confirm? This cannot be undone!');

    // Salvar as fotos selecionadas em um arquivo JSON
    const selectedPhotosArray = Object.values(selectedPhotos);
    const finalJsonContent = `[${jsonContent}\n]`; // Adiciona a quebra de linha no final
    const uploadpath = `${currentToken}/selecao_fotos.json`;

    try {
        const credentials = await getTemporaryCredentials();
        const s3 = new AWS.S3({
            credentials: credentials,
            region: 'sa-east-1', // Substitua pela sua região da AWS
        });

        const uploadParams = {
          Bucket: 'qphotos',
          Key: uploadpath, // Modify the path here
          Body: finalJsonContent,
        };

        await s3.upload(uploadParams).promise();

        console.log('Arquivo enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
    }
});

function confirmbutt() {
 document.body.appendChild(confirmButton);
}

// Inicializa a lightbox
lightbox.option({
    'resizeDuration': 200, // Ajuste a duração da redimensionamento conforme necessário
    'wrapAround': true // Configure wrapAround como true ou false conforme suas necessidades
});
