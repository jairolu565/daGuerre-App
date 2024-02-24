<!-- login.php -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Token Input</title>
</head>
<body>
    <div class="token-input-container">
        <h1>Insira seu código:</h1>
        <form id="tokenForm">
            <label for="token">Código:</label>
            <input type="text" id="token" name="token" required>
            <button type="submit">Entrar</button>
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/aws-sdk@2.1168.0/dist/aws-sdk.min.js"></script>
    <script type="module" src="scripts.js"></script>
    <script>
        document.getElementById('tokenForm').addEventListener('submit', async function(event) {
            event.preventDefault();

            const token = document.getElementById('token').value;

            // Implemente a lógica para usar o token e carregar a pasta correspondente
            const pasta_usuario = `pasta-usuario-${token}`;
            
            // Chame a função para carregar os links com base na pasta_usuario
            await loadUserLinks(pasta_usuario);

            // Redireciona para a tela principal
            window.location.href = 'index.html';
        });
    </script>
</body>
</html>
