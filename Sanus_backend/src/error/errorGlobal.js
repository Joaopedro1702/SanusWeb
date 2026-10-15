//Classe de erro com status http
class ErrorHttp extends Error{
  constructor(status, mensagem){
    super(mensagem);
    this.status = status;
  }
}

module.exports = ErrorHttp;