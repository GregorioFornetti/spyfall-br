
var teste = 5

var teste2 = setInterval(() => {
    console.log(teste)
    teste--
    if (teste === 0) {
        clearInterval(teste2)
    }
}, 1000)