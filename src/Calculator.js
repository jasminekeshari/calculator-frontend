import React, { useState, useRef, useEffect } from 'react';
import './Calculator.css';

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [memory, setMemory] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef(null);

  // Focus input on mount and when display changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setDisplay(value || '0');
    setExpression(value.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'));
    setCursorPosition(e.target.selectionStart);
  };

  const handleInputClick = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  const insertAtCursor = (text, expText = null) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentDisplay = display === '0' ? '' : display;
    const currentExpression = expression === '' ? '' : expression;

    // Insert text at cursor position
    const newDisplay = currentDisplay.substring(0, start) + text + currentDisplay.substring(end);
    const newExpression = currentExpression.substring(0, start) + (expText || text) + currentExpression.substring(end);

    setDisplay(newDisplay);
    setExpression(newExpression);

    // Set cursor position after inserted text
    setTimeout(() => {
      const newPos = start + text.length;
      input.setSelectionRange(newPos, newPos);
      setCursorPosition(newPos);
    }, 0);
  };

  const handleNumber = (num) => {
    insertAtCursor(num);
  };

  const handleOperator = (op) => {
    const opSymbol = op === '*' ? '×' : op === '/' ? '÷' : op === '-' ? '−' : op;
    insertAtCursor(' ' + opSymbol + ' ', op);
  };

  const handleBackspace = () => {
    const input = inputRef.current;
    if (!input || display === 'Error') return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    if (start === end && start > 0) {
      // Delete one character before cursor
      const newDisplay = display.substring(0, start - 1) + display.substring(start);
      const newExpression = expression.substring(0, start - 1) + expression.substring(start);
      
      setDisplay(newDisplay || '0');
      setExpression(newExpression);

      setTimeout(() => {
        input.setSelectionRange(start - 1, start - 1);
      }, 0);
    } else if (start !== end) {
      // Delete selection
      const newDisplay = display.substring(0, start) + display.substring(end);
      const newExpression = expression.substring(0, start) + expression.substring(end);
      
      setDisplay(newDisplay || '0');
      setExpression(newExpression);

      setTimeout(() => {
        input.setSelectionRange(start, start);
      }, 0);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setCursorPosition(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handlePercentage = () => {
    insertAtCursor('%', '/100');
  };

  const handleSquare = () => {
    if (expression) {
      const input = inputRef.current;
      const start = input.selectionStart || 0;
      const selected = expression.substring(0, start);
      insertAtCursor('²', '**2');
    }
  };

  const handleSquareRoot = () => {
    insertAtCursor('√(', 'Math.sqrt(');
  };

  const handleTrigFunction = (func) => {
    insertAtCursor(`${func}(`, `Math.${func}(`);
  };

  const handleConstant = (constant) => {
    const value = constant === 'π' ? 'Math.PI' : 'Math.E';
    const displayValue = constant === 'π' ? 'π' : 'e';
    insertAtCursor(displayValue, value);
  };

  const handleBracket = (bracket) => {
    insertAtCursor(bracket);
  };

  const handleMemoryAdd = () => {
    if (expression) {
      try {
        const cleanExp = expression.replace(/π/g, 'Math.PI').replace(/e(?!xp)/g, 'Math.E');
        const result = Function('"use strict"; return (' + cleanExp + ')')();
        setMemory(memory + result);
      } catch (error) {
        console.error('Memory add error');
      }
    }
  };

  const handleMemorySubtract = () => {
    if (expression) {
      try {
        const cleanExp = expression.replace(/π/g, 'Math.PI').replace(/e(?!xp)/g, 'Math.E');
        const result = Function('"use strict"; return (' + cleanExp + ')')();
        setMemory(memory - result);
      } catch (error) {
        console.error('Memory subtract error');
      }
    }
  };

  const handleMemoryRecall = () => {
    setDisplay(memory.toString());
    setExpression(memory.toString());
    setCursorPosition(memory.toString().length);
  };

  const handleMemoryClear = () => {
    setMemory(0);
  };

  const handleCalculate = async () => {
    if (!expression || expression === '' || display === '0') return;

    try {
      // Clean expression for calculation
      let cleanExp = expression
        .replace(/π/g, 'Math.PI')
        .replace(/e(?!xp)/g, 'Math.E')
        .replace(/√/g, 'Math.sqrt')
        .replace(/²/g, '**2');

      const response = await fetch('https://calculator-backend-ve6x.onrender.com/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: cleanExp })
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
      setHistory([historyItem, ...history].slice(0, 10));
      
      const resultStr = result.toString();
      setDisplay(resultStr);
      setExpression(resultStr);
      setCursorPosition(resultStr.length);
    } catch (error) {
      console.error('Error:', error);
      setDisplay('Error');
      setExpression('');
      setCursorPosition(0);
    }
  };

  const loadFromHistory = (item) => {
    const resultStr = item.result.toString();
    setDisplay(resultStr);
    setExpression(resultStr);
    setShowHistory(false);
    setCursorPosition(resultStr.length);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, display]);

  return (
    <div className={`calculator-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="calculator">
        {/* Header with controls */}
        <div className="calculator-header">
          <div className="header-title">Calculator</div>
          <div className="header-controls">
            {memory !== 0 && <span className="memory-indicator">M</span>}
            <button 
              className="icon-btn" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              title="Advanced mode"
            >
              {showAdvanced ? '🔢' : '🔬'}
            </button>
            <button 
              className="icon-btn" 
              onClick={() => setShowHistory(!showHistory)}
              title="Show history"
            >
              📜
            </button>
            <button 
              className="icon-btn" 
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Editable Display with cursor */}
        <div className="display-container">
          <input
            ref={inputRef}
            type="text"
            className="display-input"
            value={display}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onKeyUp={handleInputClick}
            placeholder="0"
            autoFocus
          />
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3>History</h3>
              <button onClick={handleClearHistory} className="clear-history-btn">
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
            <button className="btn advanced" onClick={() => handleBracket('(')}>(</button>
            <button className="btn advanced" onClick={() => handleBracket(')')}>)</button>
          </div>
        )}

        {/* Memory Functions */}
        <div className="memory-panel">
          <button className="btn memory" onClick={handleMemoryClear} title="Memory Clear">MC</button>
          <button className="btn memory" onClick={handleMemoryRecall} title="Memory Recall">MR</button>
          <button className="btn memory" onClick={handleMemoryAdd} title="Memory Add">M+</button>
          <button className="btn memory" onClick={handleMemorySubtract} title="Memory Subtract">M−</button>
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
          💡 Click display to edit • Arrow keys to move cursor • Type directly
        </div>
      </div>
    </div>
  );
}

export default Calculator;