
/************************************* INPUTS/OUTPUTS *******************************************/
//GLOBALS
const dividend = getElement('#input1');
const divisor = getElement('#input2');
const operation = getElement('#operation');
const result = getElement('#result');

const decimalOperand1 = getElement('#decimal1');
const decimalOperand2 = getElement('#decimal2');
const decimalOperation = getElement('#decimal-operation');
const decimalResult = getElement('#decimal-result');

const sideBlock = getElement('#side--block');
const method1Result = getElement('#method1');
const method2Result = getElement('#method2');


performResults('#form', 'input', (element) => {
    
    decimalOperand1.value = convertAnyToDecimal(getElement('#input1').value, 2);
    decimalOperand2.value = convertAnyToDecimal(getElement('#input2').value, 2);

    decimalOperation.value = getElement('#operation').value;
    sideBlock.style.display = (getElement('#operation').value == 'subtract') ? 'block' : 'none';
    
    if(getElement('#operation').value == 'divide'){
        getElement('#label--result').innerHTML = 'Result (Whole Number)';
        getElement('#label--decimalResult').innerHTML = 'Result (Whole Number)';
    }
})

//HELPERS
function getElement(query){
    return document.querySelector(query);
}

function queryListener(id, event, lambda){
    const element = getElement(id);
    element.addEventListener(event, () => lambda(element));
}

function performResults(id, event, lambda){
    queryListener(id, event, (element) => {
        lambda(element);

        //binary operation
        let results = binaryPerformOperation(dividend.value, divisor.value, operation.value);
       
        if(operation.value == 'subtract'){
            result.value = results[0];
            method1Result.value = results[0];
            method2Result.value = results[1];
        }
        result.value = results;
        
        //decimal operation
        decimalResult.value = decimalPerformOperation(decimalOperand1.value, decimalOperand2.value, decimalOperation.value);
    })
}

function decimalPerformOperation(operand1, operand2, operation){
    operand1 = (operand1) ? parseInt(operand1, 10) : 0;
    operand2 = (operand2) ? parseInt(operand2, 10) : 0;
    switch (operation) {
        case 'add':         return operand1 + operand2;
        case 'subtract':    return operand1 - operand2;
        case 'multiply':    return operand1 * operand2;
        default:            return Math.floor(operand1 / operand2);
    }
}

function binaryPerformOperation(operand1, operand2, operation){
    switch (operation) {
        case 'add':         return binaryAddition(operand1, operand2);
        case 'subtract':    return binarySubtraction(operand1, operand2);
        case 'multiply':    return binaryMultiplication(operand1, operand2);
        default:            return binaryDivision(operand1, operand2);
    }
}

/************************************* CALCULATIONS *******************************************/
function binarySubtraction(operand1, operand2){
    return [method1Subtraction(operand1, operand2), method2Subtraction(operand1, operand2)];
}

//Function subtractBit function (Binary 1's compliment method)
/*
    desc: Performs a subtraction/borrowing in a binary 
    params: object{
            maximun bit = currrent maximum bit, 
            mininum bit = currrent minimum bit, 
            max byte/s = max byte/s = maximum length between operand1 and operand2, 
            index = index of max byte's from to where to borrow/subtract
        }
    returns: A Bit string difference of the maximum bit and minimum bit

    *** Note: Params accepts only a bit format (0 or 1) ***
*/

function subtractBit(object){
    if(object.index == 0 && object.minBit > object.maxBit)
        return clipSign('1');

    if(object.minBit <= object.maxBit)
        return object.maxBit - object.minBit;

    const index = reverseFind(object.bits, '1', object.index)
    object.bits = replaceAt(object.bits, index, '0');

    const reversed = object.bits.substring(index+1, object.index).replaceAll('0', '1');
    object.bits = object.bits.substring(0, index+1) + reversed + object.bits.substring(object.index);
    return '1';
}


//Function Method1Subtraction function (Binary 1's compliment method)
/*
    desc: Performs a subtraction with 2 operands using 1's compliment 
    params: Operand1(as a subtrahend), Operand2(as a minuend);
    returns: Binary String difference of subtrahend(operand1) and minuend(operand2)

    *** Note: Params accepts only a binary format ***
*/
function method1Subtraction(operand1, operand2){
    if(!(operand1 && operand2))
    return '0';
    
    let max = trimBegin(operand1.toString(), '0');
    let min = trimBegin(operand2.toString(), '0');

    let bitSign;
    let result = '';

    if (min.length > max.length){
        [max, min] = [min, max];
        bitSign = '-'
    }

    for(let i = 0; i < max.length; i++){
        const maxIndex = max.length-i-1;
        const minIndex = min.length-i-1;

        let maxBit = parseInt(max.charAt(maxIndex), 10);
        let minBit = (i < min.length) ? parseInt(min.charAt(minIndex), 10) : 0;
        
        let object = {
            maxBit: maxBit,
            minBit: minBit,
            bits: max,
            index: maxIndex
        }

        let diff = subtractBit(object);
        max = object.bits;
        result = diff.toString().concat(result);
    }
    
    result = trimBegin(result, '0');
    if(bitSign)
        result = bitSign.concat(result);
    return result;
}


//Function Method2Subtraction function (Binary 2's compliment method)
/*
    desc: Performs a subtraction with 2 operands using 1's compliment 
    params: Operand1(as a subtrahend), Operand2(as a minuend);
    returns: Binary String difference of subtrahend(operand1) and minuend(operand2)
    
    *** Note: Params accepts only a binary format ***
*/
function method2Subtraction(operand1, operand2){
    if(!(operand1 && operand2))
        return '0';

    let subtrahend = trimBegin(operand1.toString(), '0');
    let minuend = trimBegin(operand2.toString(), '0');

    if(subtrahend.length > minuend.length)
        minuend = fillBegin(minuend, '0', subtrahend.length - minuend.length)
    else
        minuend = '0'.concat(minuend);

    minuend = reverseBits(minuend);
    minuend = binaryAddition(minuend, '1');

    let sum = binaryAddition(subtrahend, minuend, true);
    let bitSign = '';

    let firstItem = sum.value.charAt(0);
    if (firstItem == '1' && minuend.length > subtrahend.length)
        sum.value = clipSign(firstItem).concat(sum.value.slice(1));

    return bitSign.concat(trimBegin(sum.value, '0'));
}

//Function binaryAddition function
/*
    desc: Performs a summation of 2 operands 
    params: Operand1, Operand2, allowCarry( if caller allows a carrier at the first bit of result(which is binary))
    returns: A Binary string format, or if allowCarry is true it returns a object of last remainder and the binary 

    *** Note: Params accepts only a binary format ***
*/
function binaryAddition(operand1, operand2, allowCarry=false){
    if(!(operand1 && operand2))
        return '0';
        
    operand1 = trimBegin(operand1.toString(), '0');
    operand2 = trimBegin(operand2.toString(), '0');

    let result = '';
    let remainder = 0;

    let min = operand2;
    let max = operand1;
    
    if(min.length != max.length){
        min = getMinByLength(operand1, operand2);
        max = getMaxByLength(operand1, operand2);
    }

    for(let i = 0; i < max.length; i++){
        const maxIndex = max.length-i-1;
        const minIndex = min.length-i-1;

        let bit1 = parseInt(max.charAt(maxIndex), 10);
        let bit2 = (i < min.length) ? parseInt(min.charAt(minIndex), 10) : 0;
        
        let sum = bit1 + bit2 + remainder;

        let binary = convertDecimalToAny(sum, 2);
        sum = sumOf(binary);
        remainder = remainderOf(binary);

        result = sum.concat(result);
    }
    
    if(allowCarry)
        return { value: result, remainder: remainder};

    if(remainder !== 0)
        result = remainder.toString().concat(result);

     return result;
}

function binaryMultiplication(operand1, operand2){
    if(!(operand1 && operand2))
        return '0';

    operand1 = trimBegin(operand1.toString(), '0');
    operand2 = trimBegin(operand2.toString(), '0');
    
    let product = '0';

    for(let i = 0; i < operand2.length; i++){
        let currrentBit = operand2.charAt(operand2.length-1-i);
        
        let sum = currrentBit == '1' ?  operand1 : '0'.repeat(operand1.length);
        let result = sum.concat('0'.repeat(i));
        product = binaryAddition(product, result);
    }

    return product;
}

function binaryDivision(dividend, divisor){
    if(!(dividend && divisor))
        return '0';

    dividend = trimBegin(dividend.toString(), '0');
    divisor = trimBegin(divisor.toString(), '0');

    let divisorDecimalValue = convertAnyToDecimal(divisor, 2);
    if(divisorDecimalValue > convertAnyToDecimal(dividend, 2))
        return '0';

    let quotient = '0';
    let remaining = '';
    for(let i = 0; i < dividend.length; i++){
        remaining = remaining.concat(dividend.charAt(i));
        let remainingDecimalValue = convertAnyToDecimal(remaining, 2);

        if(remainingDecimalValue >= divisorDecimalValue){
            quotient = quotient.concat('1');
            remaining = method1Subtraction(remaining, divisor)
        }
        else
            quotient = quotient.concat('0');
    }

    return trimBegin(quotient, '0');
}

/************************************* BINARY STRING MANIPULATOR *******************************************/
function getMaxByLength(a, b){
    return a.length > b.length ? a : b;
}

function getMinByLength(a, b){
    return a.length < b.length ? a : b;
}

function clipSign(bitSign){
    return `(${bitSign})`;
}

function fillBegin(string, char, length){
    return char.repeat(length).concat(string);
}

function trimBegin(string, char){
    let counter = 0;
    string = string.toString();

    for(let item of string.split('')){
        if(item === char) counter++;
        else break;        
    }

    let result = string.slice(counter);

    return result ? result : char;
}

function reverseBits(bits){
    if(bits == '' || !bits)
        return '';

    return bits.replaceAll('0', 'a')
        .replaceAll('1', '0')
        .replaceAll('a', '1');
}

function reverseFind(bits, char, from){
    from = (from) ? from : bits.length-1;

    let sliced = bits.slice(0, from);
    for(let i = sliced.length-1; i >= 0; i--)
        if(sliced.charAt(i) == char)
            return i;

    return -1;
}

function replaceAt(string, index, char){
    return string.substr(0, index) + char + string.substr(index+char.length);
}

function remainderOf(bits){
    if(!bits || bits.length == 1) return 0;
    return parseInt(bits.charAt(0), 10);
}

function sumOf(bits){
    if(bits === '') 
        return '0';
    if(bits.length == 1) 
        return bits;
    return bits.slice(-1);
}


/************************************* OTHER HELPERS *******************************************/
function convertAnyToDecimal(value, baseFrom){
    let number = value.toString();
    let index = number.indexOf('.');
    let weight = number.length - 1;

    if(index != -1){
        let fraction = (index == -1) ? "" : number.substr(index+1);
        weight = number.length - fraction.length - 2;
    }
    
    let result = 0;
    number.split('').forEach(digit => {
        if(digit == '.') return;

        if(baseFrom == 16)
            digit = hexaNotation(digit);
        if(baseFrom == 2)
            digit = (digit == 1 || digit == 0) ? digit : 0;

        let product = digit * Math.pow(baseFrom, weight);
        result += product;
        weight--;
    })

    return result;
}

function convertDecimalToAny(decimalValue, baseTo){
    let result = '';
    let number = decimalValue.toString();

    let index = number.indexOf('.');
    if(index != -1)
        number = number.substring(0, index);

    while(number > 0){
        if(baseTo == 2){
            let bit = (number % 2 == 0) ? '0' : '1';
            result = bit.concat(result);
        }
        else{
            let remainder = number % baseTo;
            if(baseTo == 16)
                remainder = hexaNotation(remainder);
            result = remainder.toString().concat(result);
        }
        number = Math.floor(number/baseTo);
    }

    let fraction = convertFractionToAny(decimalValue, baseTo, 10);
    result = result.concat(fraction);
    return result;
}

function convertFractionToAny(decimalValue, baseTo, repeat){
    let number = decimalValue.toString();
    let index = number.indexOf('.');
    if(index == -1) return '';

    let result = '';
    let fraction = number.substr(index);
    for (let i = 0; i < repeat; i++) {
        let product = (fraction * baseTo).toString();
        let index = product.indexOf('.');
        
        let digit = product.substring(0, index); 
        if(baseTo == 16)
            digit = hexaNotation(digit);
        result = result.concat(digit);
        fraction = product.substr(index);
    }

    return (result == '') ? '' : '.'.concat(result);
}
