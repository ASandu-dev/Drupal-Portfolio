function toggle(){
    if (document.getElementById('nav').className !== ('active')){
      document.getElementById('nav').className += ('active');
    }else if (document.getElementById('nav').className === ('active')){
    document.getElementById('nav').classList.remove('active');
  }



}
