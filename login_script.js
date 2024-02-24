// ... Seu código anterior

// Função para carregar links do arquivo JSON
async function loadLinksFromFolder(folderName) {
  try {
      const credentials = await getTemporaryCredentials();
      const s3 = new AWS.S3({
          credentials: credentials,
          region: 'sa-east-1', // Substitua pela sua região da AWS
      });

      const response = await s3.getObject({
          Bucket: 'qphotos',
          Key: `${folderName}/links.json`,
      }).promise();

      const links = JSON.parse(response.Body.toString('utf-8'));
      console.log('Links carregados com sucesso:', links);
      return links;
  } catch (error) {
      console.error('Erro ao carregar links do arquivo JSON:', error);
      return [];
  }
}

// Função para redirecionar o usuário com base no token
function redirectToUserPage(token) {
  loadLinksFromFolder(token)
      .then((links) => {
          // Aqui você pode fazer o que for necessário com os links carregados
          // Por exemplo, redirecionar para uma página principal que usa esses links
          window.location.href = `pagina_principal.html?token=${token}`;
      })
      .catch((error) => {
          console.error('Erro ao carregar links:', error);
          // Aqui você pode tratar o erro de forma adequada, como exibir uma mensagem para o usuário
      });
}

// Adicione a lógica de redirecionamento ao seu formulário de login
document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const token = document.getElementById('token').value;
  redirectToUserPage(token);
});

// Restante do seu código...
