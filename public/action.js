function executeAction(method){

    switch(method.action){
        case 'changebackgroundColor':
            changebackgroundColor(method.parameters.color);
        break;
    }
}

function changebackgroundColor(color){
    document.body.style.backgroundColor = color;
}