install
 - yarn install

models
 - npx prisma migrate dev

run 
 - yarn start

 Rode a API em localhost:3001 http://localhost:3001/api-docs com funcoes no swagger.

 Criar User
   - para criar user preencha o campo authentication como "local" ou "github"  
   - em CODE preencha com o authorization code extraido do oauthdebugger caso o campo o authentication === "github"

 Login
   - entre com o login e password cridos em create user para gerar JWT de acesso

 Get User
   - copie e cole o acces_token gerado em login na chave de autorizacao de swagger para testar JWT


 - Renomeie o example.env para .env e insira suas informacoes.  
  