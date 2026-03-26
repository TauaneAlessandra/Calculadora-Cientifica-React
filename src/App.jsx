// useState é o hook do React para criar variáveis reativas:
// quando o valor muda, o componente re-renderiza automaticamente.
import { useState } from 'react'

// Componentes do Ant Design usados na interface:
// - ConfigProvider: configura o tema global (cores, dark mode, etc.)
// - Button: botão estilizado
// - Tag: etiqueta pequena (usada nos controles DEG/RAD, 2nd, π, e, 1/x)
// - theme: objeto com algoritmos de tema (dark, light, compact)
import { ConfigProvider, Button, Tag, theme as antTheme } from 'antd'

// Importa o CSS específico deste componente
import './App.css'

// --- Funções utilitárias de conversão de ângulo ---

// Converte graus para radianos (usado antes de chamar Math.sin/cos/tan
// quando o modo está em DEG, pois o JavaScript trabalha sempre em radianos)
const toRad = (deg) => (deg * Math.PI) / 180

// Converte radianos para graus (usado após asin/acos/atan no modo DEG)
const toDeg = (rad) => (rad * 180) / Math.PI

// --- Função de formatação do resultado ---

// Recebe um valor numérico e retorna uma string formatada para exibir no display.
// Regras:
//   - Se for string (ex: 'Erro'), retorna como está
//   - Se for NaN ou Infinity, retorna 'Erro'
//   - Limita a 12 dígitos significativos (evita ruído de ponto flutuante)
//   - Substitui ponto por vírgula (padrão brasileiro)
const fmt = (value) => {
  if (typeof value === 'string') return value
  if (isNaN(value) || !isFinite(value)) return 'Erro'
  const rounded = parseFloat(value.toPrecision(12))
  const str = String(rounded)
  return str.includes('.') ? str.replace('.', ',') : str
}

// --- Componente principal da Calculadora ---
function Calculator() {

  // display: o número atualmente visível na tela
  const [display, setDisplay] = useState('0')

  // expression: a linha de histórico acima do display (ex: "3 + 5 =")
  const [expression, setExpression] = useState('')

  // firstOperand: o primeiro número de uma operação binária (ex: o "3" de "3 + ?")
  const [firstOperand, setFirstOperand] = useState(null)

  // operator: o operador atual (+, -, ×, ÷, xʸ, ʸ√x)
  const [operator, setOperator] = useState(null)

  // waitingForSecond: true quando o operador foi pressionado e
  // esperamos o segundo número ser digitado
  const [waitingForSecond, setWaitingForSecond] = useState(false)

  // isRad: modo de ângulo — false = graus (DEG), true = radianos (RAD)
  const [isRad, setIsRad] = useState(false)

  // isShift: modo "2nd" — exibe funções científicas alternativas (inversas, cúbicas, etc.)
  const [isShift, setIsShift] = useState(false)

  // justCalculated: true após pressionar "=" — o próximo dígito inicia um novo cálculo
  const [justCalculated, setJustCalculated] = useState(false)

  // Lê o valor atual do display convertendo vírgula para ponto (padrão JS)
  const currentValue = () => parseFloat(display.replace(',', '.'))

  // --- Handlers de entrada ---

  // Chamado quando um botão numérico (0-9) é pressionado
  const handleNumber = (num) => {
    // Se acabou de calcular, começa um número novo do zero
    if (justCalculated) {
      setDisplay(String(num))
      setExpression('')
      setJustCalculated(false)
      return
    }
    // Se operador foi pressionado, substitui o display pelo novo dígito
    if (waitingForSecond) {
      setDisplay(String(num))
      setWaitingForSecond(false)
    } else {
      // Concatena o dígito (substitui o "0" inicial para não virar "07")
      setDisplay(display === '0' ? String(num) : display + num)
    }
  }

  // Chamado quando o botão "," é pressionado
  const handleDecimal = () => {
    if (justCalculated) { setDisplay('0,'); setExpression(''); setJustCalculated(false); return }
    if (waitingForSecond) { setDisplay('0,'); setWaitingForSecond(false); return }
    // Só adiciona vírgula se ainda não tiver uma no display
    if (!display.includes(',')) setDisplay(display + ',')
  }

  // --- Cálculo binário (operações com dois operandos) ---

  // Recebe dois números e um operador, retorna o resultado
  const calculate = (a, b, op) => {
    switch (op) {
      case '+':    return a + b
      case '-':    return a - b
      case '×':    return a * b
      case '÷':    return b !== 0 ? a / b : 'Erro' // evita divisão por zero
      case 'xʸ':   return Math.pow(a, b)            // a elevado a b
      case 'ʸ√x':  return Math.pow(a, 1 / b)        // raiz b-ésima de a
      default:     return b
    }
  }

  // Chamado quando um operador (+, -, ×, ÷, xʸ, ʸ√x) é pressionado
  const handleOperator = (op) => {
    const current = currentValue()
    setJustCalculated(false)

    // Se já temos um primeiro operando e ainda não esperamos o segundo,
    // calculamos o resultado parcial antes de aplicar o novo operador
    if (firstOperand !== null && !waitingForSecond) {
      const result = calculate(firstOperand, current, operator)
      if (result === 'Erro') { setDisplay('Erro'); return }
      setDisplay(fmt(result))
      setFirstOperand(result)
      setExpression(`${fmt(result)} ${op}`)
    } else {
      // Primeiro operador pressionado: salva o número atual e exibe na expressão
      setFirstOperand(current)
      setExpression(`${display} ${op}`)
    }

    setOperator(op)
    setWaitingForSecond(true) // próximo número digitado será o segundo operando
  }

  // Chamado quando "=" é pressionado
  const handleEquals = () => {
    if (firstOperand === null || operator === null) return

    const current = currentValue()
    const result = calculate(firstOperand, current, operator)

    // Exibe a expressão completa acima do resultado
    setExpression(`${expression} ${display} =`)
    setDisplay(fmt(result))

    // Reseta o estado da operação
    setFirstOperand(null)
    setOperator(null)
    setWaitingForSecond(false)
    setJustCalculated(true)
  }

  // Limpa tudo e volta ao estado inicial
  const handleClear = () => {
    setDisplay('0')
    setFirstOperand(null)
    setOperator(null)
    setWaitingForSecond(false)
    setExpression('')
    setJustCalculated(false)
  }

  // Inverte o sinal do número no display (positivo ↔ negativo)
  const handleToggleSign = () => setDisplay(fmt(currentValue() * -1))

  // Calcula a porcentagem:
  // Se há um primeiro operando, calcula a % em relação a ele (ex: 200 + 10% = 200 + 20)
  // Caso contrário, divide por 100
  const handlePercent = () => {
    const val = firstOperand !== null
      ? firstOperand * (currentValue() / 100)
      : currentValue() / 100
    setDisplay(fmt(val))
  }

  // --- Funções científicas unárias (operam sobre o valor atual do display) ---

  const applyFn = (fn) => {
    const val = currentValue()
    let result

    switch (fn) {
      // Trigonométricas: convertem para radianos se estiver em modo DEG
      case 'sin':  result = isRad ? Math.sin(val) : Math.sin(toRad(val)); break
      case 'cos':  result = isRad ? Math.cos(val) : Math.cos(toRad(val)); break
      case 'tan':  result = isRad ? Math.tan(val) : Math.tan(toRad(val)); break

      // Inversas: resultado em graus se modo DEG, radianos se modo RAD
      case 'asin': result = isRad ? Math.asin(val) : toDeg(Math.asin(val)); break
      case 'acos': result = isRad ? Math.acos(val) : toDeg(Math.acos(val)); break
      case 'atan': result = isRad ? Math.atan(val) : toDeg(Math.atan(val)); break

      // Logaritmos
      case 'ln':   result = Math.log(val);   break // logaritmo natural (base e)
      case 'log':  result = Math.log10(val); break // logaritmo base 10
      case 'log2': result = Math.log2(val);  break // logaritmo base 2

      // Potências
      case 'x²':   result = Math.pow(val, 2); break
      case 'x³':   result = Math.pow(val, 3); break

      // Raízes
      case '√x':   result = Math.sqrt(val); break  // raiz quadrada
      case '∛x':   result = Math.cbrt(val); break  // raiz cúbica

      // Recíproco
      case '1/x':  result = val !== 0 ? 1 / val : 'Erro'; break

      // Exponenciais
      case 'eˣ':   result = Math.exp(val);        break // e elevado a val
      case '10ˣ':  result = Math.pow(10, val);    break

      // Fatorial — só funciona com inteiros não-negativos
      case 'n!': {
        if (val < 0 || !Number.isInteger(val)) { result = 'Erro'; break }
        result = 1
        for (let i = 2; i <= val; i++) result *= i
        break
      }

      // Valor absoluto (remove o sinal negativo)
      case 'abs':  result = Math.abs(val); break

      default: return
    }

    setDisplay(fmt(result))
    setJustCalculated(true)
    setWaitingForSecond(false)
  }

  // Insere uma constante matemática no display (π ou e)
  const handleConstant = (c) => {
    setDisplay(fmt(c === 'π' ? Math.PI : Math.E))
    setJustCalculated(true)
    if (waitingForSecond) setWaitingForSecond(false)
  }

  // Retorna true se o operador passado está ativo (foi pressionado e aguarda o segundo número)
  // Usado para destacar visualmente o operador selecionado
  const isActiveOp = (op) => operator === op && waitingForSecond

  // Mostra "AC" se não há nada para limpar, ou "C" se há operação em andamento
  const showAC = firstOperand === null && display === '0' && !expression

  // --- Definição dos botões científicos ---
  // isShift alterna entre duas grades: funções primárias e funções alternativas (2nd)
  const sciButtons = isShift ? [
    // Funções inversas e alternativas (modo 2nd ativo)
    { label: 'sin⁻¹', fn: 'asin' }, { label: 'cos⁻¹', fn: 'acos' },
    { label: 'tan⁻¹', fn: 'atan' }, { label: 'eˣ',    fn: 'eˣ'  },
    { label: '10ˣ',   fn: '10ˣ'  }, { label: 'log₂',  fn: 'log2'},
    { label: '∛x',    fn: '∛x'   }, { label: 'x³',    fn: 'x³'  },
    { label: 'ʸ√x',   op: 'ʸ√x'  }, { label: 'abs',   fn: 'abs' },
  ] : [
    // Funções primárias (modo 2nd inativo)
    { label: 'sin',  fn: 'sin'  }, { label: 'cos',  fn: 'cos'  },
    { label: 'tan',  fn: 'tan'  }, { label: 'ln',   fn: 'ln'  },
    { label: 'log',  fn: 'log'  }, { label: '√x',   fn: '√x'  },
    { label: 'x²',   fn: 'x²'   }, { label: 'xʸ',   op: 'xʸ'  },
    { label: 'eˣ',   fn: 'eˣ'   }, { label: 'n!',   fn: 'n!'  },
  ]

  // --- Definição das linhas de botões básicos ---
  // Cada botão tem: label (texto), action (função ao clicar),
  // type (define a cor: utility=cinza, digit=escuro, operator=laranja),
  // op (opcional, usado para destacar o operador ativo)
  const basicRows = [
    [
      { label: showAC ? 'AC' : 'C', action: handleClear,              type: 'utility' },
      { label: '+/-',               action: handleToggleSign,          type: 'utility' },
      { label: '%',                 action: handlePercent,             type: 'utility' },
      { label: '÷',                 action: () => handleOperator('÷'), type: 'operator', op: '÷' },
    ],
    [
      { label: '7', action: () => handleNumber('7'),  type: 'digit' },
      { label: '8', action: () => handleNumber('8'),  type: 'digit' },
      { label: '9', action: () => handleNumber('9'),  type: 'digit' },
      { label: '×', action: () => handleOperator('×'), type: 'operator', op: '×' },
    ],
    [
      { label: '4', action: () => handleNumber('4'),  type: 'digit' },
      { label: '5', action: () => handleNumber('5'),  type: 'digit' },
      { label: '6', action: () => handleNumber('6'),  type: 'digit' },
      { label: '−', action: () => handleOperator('-'), type: 'operator', op: '-' },
    ],
    [
      { label: '1', action: () => handleNumber('1'),  type: 'digit' },
      { label: '2', action: () => handleNumber('2'),  type: 'digit' },
      { label: '3', action: () => handleNumber('3'),  type: 'digit' },
      { label: '+', action: () => handleOperator('+'), type: 'operator', op: '+' },
    ],
  ]

  // --- JSX: estrutura visual da calculadora ---
  return (
    <div className="calc-shell">

      {/* Display: mostra a expressão (histórico) e o valor atual */}
      <div className="calc-display">
        <div className="calc-expression">{expression || '\u00A0'}</div>
        <div className="calc-value">{display}</div>
      </div>

      <div className="calc-divider" />

      {/* Barra de controles: DEG/RAD, 2nd, constantes e 1/x */}
      <div className="calc-controls">
        {/* Tag clicável que alterna entre DEG e RAD */}
        <Tag
          color={isRad ? 'orange' : 'default'}
          onClick={() => setIsRad(!isRad)}
          className="calc-tag"
        >
          {isRad ? 'RAD' : 'DEG'}
        </Tag>

        {/* Tag que ativa/desativa o modo 2nd (funções alternativas) */}
        <Tag
          color={isShift ? 'orange' : 'default'}
          onClick={() => setIsShift(!isShift)}
          className="calc-tag"
        >
          2nd
        </Tag>

        <Tag onClick={() => handleConstant('π')} className="calc-tag">π</Tag>
        <Tag onClick={() => handleConstant('e')} className="calc-tag">e</Tag>
        <Tag onClick={() => applyFn('1/x')} className="calc-tag">1/x</Tag>
      </div>

      {/* Grade dos botões científicos (5 colunas, 2 linhas) */}
      <div className="calc-sci-grid">
        {/* Percorre o array sciButtons e renderiza um Button para cada item */}
        {sciButtons.map(({ label, fn, op }) => (
          <Button
            key={label}
            className="calc-btn-sci"
            // Se o botão tem 'fn', aplica função científica; se tem 'op', usa como operador binário
            onClick={() => fn ? applyFn(fn) : handleOperator(op)}
            // Destaca como primary (laranja) se for o operador ativo
            type={op && isActiveOp(op) ? 'primary' : 'default'}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Grade dos botões básicos (4 colunas × 4 linhas) */}
      <div className="calc-basic-grid">
        {/* basicRows é um array de arrays — .map() aninhado gera os botões linha a linha */}
        {basicRows.map((row, ri) =>
          row.map((btn) => (
            <Button
              key={`${ri}-${btn.label}`}
              // A classe muda de acordo com o tipo (utility, digit, operator)
              // e adiciona --active se for o operador selecionado
              className={`calc-btn calc-btn--${btn.type}${btn.op && isActiveOp(btn.op) ? ' calc-btn--active' : ''}`}
              onClick={btn.action}
              shape="circle"
            >
              {btn.label}
            </Button>
          ))
        )}

        {/* Última linha: botão "0" (ocupa 2 colunas), vírgula e igual */}
        <Button
          className="calc-btn calc-btn--digit calc-btn--zero"
          onClick={() => handleNumber('0')}
          shape="round"
        >
          0
        </Button>
        <Button
          className="calc-btn calc-btn--digit"
          onClick={handleDecimal}
          shape="circle"
        >
          ,
        </Button>
        <Button
          className="calc-btn calc-btn--operator"
          onClick={handleEquals}
          shape="circle"
        >
          =
        </Button>
      </div>
    </div>
  )
}

// --- Componente raiz exportado ---
// Envolve a calculadora com o ConfigProvider do Ant Design,
// que aplica o tema dark e define a cor primária laranja globalmente.
export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: antTheme.defaultAlgorithm, // tema claro do Ant Design
        token: {
          colorPrimary: '#1253d9',           // cor primária: azul
          borderRadius: 999,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <Calculator />
    </ConfigProvider>
  )
}
