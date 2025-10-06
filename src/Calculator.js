import React, { useState } from 'react';
import './Calculator.css';

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const handleNumber = (num) => {
    if (display === '0') {
      setDisplay(num);
      setExpression(num);
    } else {
      setDisplay(display + num);
      setExpression(expression + num);
    }
  };

  const handleOperator = (op) => {
    setDisplay(display + ' ' + op + ' ');
    setExpression(expression + op);
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleCalculate = async () => {
    try {
      const response = await fetch('https://calculator-backend-ve6x.onrender.com/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression })
      });
      const data = await response.json();
      setDisplay(data.result.toString());
      setExpression(data.result.toString());
    } catch (error) {
      setDisplay('Error');
    }
  };

  return (
    
    <div className="calculator-container">
      <div className="calculator">
        <div className="display">{display}</div>

        <div className="buttons">
          <button className="btn clear" onClick={handleClear}>C</button>
          <button className="btn operator" onClick={() => handleOperator('/')}>/</button>
          <button className="btn operator" onClick={() => handleOperator('*')}>×</button>
          <button className="btn operator" onClick={() => handleOperator('-')}>−</button>
          
          <button className="btn" onClick={() => handleNumber('7')}>7</button>
          <button className="btn" onClick={() => handleNumber('8')}>8</button>
          <button className="btn" onClick={() => handleNumber('9')}>9</button>
          <button className="btn operator" onClick={() => handleOperator('+')}>+</button>
          
          <button className="btn" onClick={() => handleNumber('4')}>4</button>
          <button className="btn" onClick={() => handleNumber('5')}>5</button>
          <button className="btn" onClick={() => handleNumber('6')}>6</button>
          <button className="btn equals" onClick={handleCalculate}>=</button>
          
          <button className="btn" onClick={() => handleNumber('1')}>1</button>
          <button className="btn" onClick={() => handleNumber('2')}>2</button>
          <button className="btn" onClick={() => handleNumber('3')}>3</button>
          
          <button className="btn zero" onClick={() => handleNumber('0')}>0</button>
          <button className="btn" onClick={() => handleNumber('.')}>.</button>
        </div>
      </div>
    </div>
  );
}

export default Calculator;