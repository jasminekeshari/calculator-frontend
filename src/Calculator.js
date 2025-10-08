import React, { useState, useEffect, useRef } from 'react';
import './Calculator.css';

function Calculator() {
  const [expression, setExpression] = useState('');
  const [liveResult, setLiveResult] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [memory, setMemory] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef(null);

  // Calculate live preview
  useEffect(() => {
    const calculateLivePreview = async () => {
      if (!expression || expression === '0') {
        setLiveResult('');
        return;
      }

      try {
        // Convert display expression to calculable expression
        let calcExpression = expression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-');

        // Try to evaluate locally first for instant feedback
        try {
          const localResult = Function('"use strict"; return (' + calcExpression + ')')();
          if (isFinite(localResult) && !isNaN(localResult)) {
            setLiveResult(localResult.toString());
          } else {
            setLiveResult('');
          }
        } catch {
          setLiveResult('');
        }
      } catch (error) {
        setLiveResult('');
      }
    };

    const debounce = setTimeout(calculateLivePreview, 300);
    return () => clearTimeout(debounce);
  }, [expression]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't interfere if user is typing in input
      if (document.activeElement === inputRef.current) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        handleOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === '.') {
        handleNumber('.');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [expression]);

  const insertAtCursor = (text) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentExpression = expression || '';
    
    const newExpression = 
      currentExpression.substring(0, start) + 
      text + 
      currentExpression.substring(end);
    
    setExpression(newExpression);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      const newPosition = start + text.length;
      input.setSelectionRange(newPosition, newPosition);
      input.focus();
    }, 0);
  };

  const handleNumber = (num) => {
    insertAtCursor(num);
  };

  const handleOperator = (op) => {
    const opSymbol = op === '*' ? '×' : op === '/' ? '÷' : op === '-' ? '−' : op;
    insertAtCursor(' ' + opSymbol + ' ');
  };

  const handleBackspace = () => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    
    if (start === 0 && end === 0) return;
    
    const currentExpression = expression || '';
    let newExpression;
    let newPosition;
    
    if (start === end) {
      // No selection, delete character before cursor
      newExpression = 
        currentExpression.substring(0, start - 1) + 
        currentExpression.substring(start);
      newPosition = start - 1;
    } else {
      // Delete selection
      newExpression = 
        currentExpression.substring(0, start) + 
        currentExpression.substring(end);
      newPosition = start;
    }
    
    setExpression(newExpression);
    
    setTimeout(() => {
      input.setSelectionRange(newPosition, newPosition);
      input.focus();
    }, 0);
  };

  const handleClear = () => {
    setExpression('');
    setLiveResult('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handlePercentage = () => {
    insertAtCursor('%');
  };

  const handleSquare = () => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentExpression = expression || '';
    
    if (start === end && start > 0) {
      // Find the number before cursor
      let numStart = start - 1;
      while (numStart > 0 && /[\d.]/.test(currentExpression[numStart - 1])) {
        numStart--;
      }
      
      const beforeNum = currentExpression.substring(0, numStart);
      const num = currentExpression.substring(numStart, start);
      const afterNum = currentExpression.substring(start);
      
      const newExpression = beforeNum + '(' + num + ')**2' + afterNum;
      setExpression(newExpression);
      
      setTimeout(() => {
        const newPosition = beforeNum.length + num.length + 6;
        input.setSelectionRange(newPosition, newPosition);
        input.focus();
      }, 0);
    }
  };

  const handleSquareRoot = () => {
    insertAtCursor('√(');
  };

  const handleTrigFunction = (func) => {
    insertAtCursor(func + '(');
  };

  const handleConstant = (constant) => {
    const value = constant === 'π' ? 'π' : 'e';
    insertAtCursor(value);
  };

  const handleMemoryAdd = async () => {
    if (liveResult) {
      const result = parseFloat(liveResult);
      setMemory(memory + result);
    }
  };

  const handleMemorySubtract = async () => {
    if (liveResult) {
      const result = parseFloat(liveResult);
      setMemory(memory - result);
    }
  };

  const handleMemoryRecall = () => {
    insertAtCursor(memory.toString());
  };

  const handleMemoryClear = () => {
    setMemory(0);
  };

  const handleCalculate = async () => {
    if (!expression) return;

    try {
      // Convert display expression to calculable expression
      let calcExpression = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'Math.PI')
        .replace(/e(?![a-z])/gi, 'Math.E')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/(\d+)%/g, '($1/100)');

      const response = await fetch('https://calculator-backend-ve6x.onrender.com/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: calcExpression })
      });
      
      if (!response.ok) {
        throw new Error('Calculation failed');
      }
      
      const data = await response.json();
      const result = data.result;
      
      // Add to history
      const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory([historyItem, ...history].slice(0, 10));
      
      // Replace expression with result
      setExpression(result.toString());
      setLiveResult('');
      
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(result.toString().length, result.toString().length);
        }, 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setExpression('Error');
      setLiveResult('');
      setTimeout(() => {
        setExpression('');
        if (inputRef.current) inputRef.current.focus();
      }, 1000);
    }
  };

  const loadFromHistory = (item) => {
    setExpression(item.result.toString());
    setShowHistory(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e) => {
    setExpression(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCalculate();
    } else if (e.key === 'Escape') {
      handleClear();
    }
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

        {/* Editable Display with Live Preview */}
        <div className="display-container">
          <input
            ref={inputRef}
            type="text"
            className="display-input"
            value={expression}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="0"
            spellCheck="false"
            autoComplete="off"
          />
          {liveResult && (
            <div className="live-preview">
              = {liveResult}
            </div>
          )}
        </div>

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
          💡 Click anywhere in the display to edit • Type directly or use buttons • Enter = Calculate
        </div>
      </div>
    </div>
  );
}

export default Calculator;