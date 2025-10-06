import React, { useState, useEffect } from 'react';
import './Calculator.css';

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [memory, setMemory] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        handleOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === '.') {
        handleNumber('.');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, expression,handleBackspace, handleCalculate, handleNumber, handleOperator]);

  const handleNumber = (num) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
      setExpression(num);
    } else {
      setDisplay(display + num);
      setExpression(expression + num);
    }
  };

  const handleOperator = (op) => {
    if (display === 'Error') {
      handleClear();
      return;
    }
    const opSymbol = op === '*' ? '×' : op === '/' ? '÷' : op;
    setDisplay(display + ' ' + opSymbol + ' ');
    setExpression(expression + op);
  };

  const handleBackspace = () => {
    if (display === '0' || display === 'Error') return;
    
    const newDisplay = display.slice(0, -1) || '0';
    const newExpression = expression.slice(0, -1) || '';
    
    setDisplay(newDisplay);
    setExpression(newExpression);
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handlePercentage = () => {
    if (expression) {
      const newExpression = expression + '/100';
      setExpression(newExpression);
      setDisplay(display + '%');
    }
  };

  const handleSquare = () => {
    if (expression) {
      const newExpression = '(' + expression + ')**2';
      setExpression(newExpression);
      setDisplay(display + '²');
    }
  };

  const handleSquareRoot = () => {
    if (expression) {
      const newExpression = 'Math.sqrt(' + expression + ')';
      setExpression(newExpression);
      setDisplay('√(' + display + ')');
    }
  };

  const handleTrigFunction = (func) => {
    if (expression) {
      const newExpression = `Math.${func}(${expression}*Math.PI/180)`;
      setExpression(newExpression);
      setDisplay(`${func}(${display})`);
    }
  };

  const handleConstant = (constant) => {
    const value = constant === 'π' ? 'Math.PI' : 'Math.E';
    const displayValue = constant === 'π' ? '3.14159' : '2.71828';
    
    if (display === '0') {
      setDisplay(displayValue);
      setExpression(value);
    } else {
      setDisplay(display + displayValue);
      setExpression(expression + value);
    }
  };

  const handleMemoryAdd = () => {
    if (expression) {
      try {
       const result = eval(expression);
        setMemory(memory + result);
      } catch (error) {
        console.error('Memory add error');
      }
    }
  };

  const handleMemorySubtract = () => {
    if (expression) {
      try {
        const result = eval(expression);
        setMemory(memory - result);
      } catch (error) {
        console.error('Memory subtract error');
      }
    }
  };

  const handleMemoryRecall = () => {
    setDisplay(memory.toString());
    setExpression(memory.toString());
  };

  const handleMemoryClear = () => {
    setMemory(0);
  };

  const handleCalculate = async () => {
    if (!expression) return;

    try {
      const response = await fetch('https://calculator-backend-ve6x.onrender.com/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression })
      });
      
      if (!response.ok) {
        throw new Error('Calculation failed');
      }
      
      const data = await response.json();
      const result = data.result;
      
      // Add to history
      const historyItem = {
        expression: display,
        result: result,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory([historyItem, ...history].slice(0, 10)); // Keep last 10
      
      setDisplay(result.toString());
      setExpression(result.toString());
    } catch (error) {
      console.error('Error:', error);
      setDisplay('Error');
      setExpression('');
    }
  };

  const loadFromHistory = (item) => {
    setDisplay(item.result.toString());
    setExpression(item.result.toString());
    setShowHistory(false);
  };

  return (
    <div className={`calculator-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="calculator">
        {/* Header with controls */}
        <div className="calculator-header">
          <button 
            className="theme-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button 
            className="history-toggle" 
            onClick={() => setShowHistory(!showHistory)}
            title="Show history"
          >
            📜
          </button>
          <button 
            className="advanced-toggle" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            title="Advanced mode"
          >
            {showAdvanced ? '🔢' : '🔬'}
          </button>
          {memory !== 0 && <span className="memory-indicator">M</span>}
        </div>

        {/* Display */}
        <div className="display">{display}</div>

        {/* History Panel */}
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3>History</h3>
              <button onClick={handleClearHistory} className="clear-history">
                Clear All
              </button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <p className="no-history">No calculations yet</p>
              ) : (
                history.map((item, index) => (
                  <div 
                    key={index} 
                    className="history-item"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="history-expression">{item.expression}</div>
                    <div className="history-result">= {item.result}</div>
                    <div className="history-time">{item.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Advanced Functions */}
        {showAdvanced && (
          <div className="advanced-panel">
            <button className="btn advanced" onClick={() => handleTrigFunction('sin')}>sin</button>
            <button className="btn advanced" onClick={() => handleTrigFunction('cos')}>cos</button>
            <button className="btn advanced" onClick={() => handleTrigFunction('tan')}>tan</button>
            <button className="btn advanced" onClick={handleSquareRoot}>√</button>
            <button className="btn advanced" onClick={handleSquare}>x²</button>
            <button className="btn advanced" onClick={() => handleConstant('π')}>π</button>
            <button className="btn advanced" onClick={() => handleConstant('e')}>e</button>
            <button className="btn advanced" onClick={handlePercentage}>%</button>
          </div>
        )}

        {/* Memory Functions */}
        <div className="memory-panel">
          <button className="btn memory" onClick={handleMemoryClear} title="Memory Clear">MC</button>
          <button className="btn memory" onClick={handleMemoryRecall} title="Memory Recall">MR</button>
          <button className="btn memory" onClick={handleMemoryAdd} title="Memory Add">M+</button>
          <button className="btn memory" onClick={handleMemorySubtract} title="Memory Subtract">M-</button>
        </div>

        {/* Main Buttons */}
        <div className="buttons">
          <button className="btn clear" onClick={handleClear}>C</button>
          <button className="btn backspace" onClick={handleBackspace} title="Backspace">⌫</button>
          <button className="btn operator" onClick={() => handleOperator('/')}>÷</button>
          <button className="btn operator" onClick={() => handleOperator('*')}>×</button>
          
          <button className="btn" onClick={() => handleNumber('7')}>7</button>
          <button className="btn" onClick={() => handleNumber('8')}>8</button>
          <button className="btn" onClick={() => handleNumber('9')}>9</button>
          <button className="btn operator" onClick={() => handleOperator('-')}>−</button>
          
          <button className="btn" onClick={() => handleNumber('4')}>4</button>
          <button className="btn" onClick={() => handleNumber('5')}>5</button>
          <button className="btn" onClick={() => handleNumber('6')}>6</button>
          <button className="btn operator" onClick={() => handleOperator('+')}>+</button>
          
          <button className="btn" onClick={() => handleNumber('1')}>1</button>
          <button className="btn" onClick={() => handleNumber('2')}>2</button>
          <button className="btn" onClick={() => handleNumber('3')}>3</button>
          <button className="btn equals" onClick={handleCalculate}>=</button>
          
          <button className="btn zero" onClick={() => handleNumber('0')}>0</button>
          <button className="btn" onClick={() => handleNumber('.')}>.</button>
        </div>

        {/* Keyboard hints */}
        <div className="keyboard-hints">
          ⌨️ Keyboard: Numbers, +−×÷, Enter = Calculate, Esc = Clear, Backspace = Delete
        </div>
      </div>
    </div>
  );
}

export default Calculator;