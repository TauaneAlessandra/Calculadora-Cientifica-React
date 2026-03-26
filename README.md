# Calculadora Científica

Calculadora científica moderna construída com **React**, **Vite** e **Ant Design**.

## Tecnologias

- [React 19](https://react.dev/) — biblioteca de UI
- [Vite 8](https://vite.dev/) — build tool e dev server
- [Ant Design](https://ant.design/) — design system (dark theme)

## Funcionalidades

### Básicas
- Operações: `+` `-` `×` `÷`
- Porcentagem (`%`) e troca de sinal (`+/-`)
- Encadeamento de operações
- Histórico da expressão no display

### Científicas
| Função | Descrição |
|---|---|
| `sin` `cos` `tan` | Funções trigonométricas |
| `sin⁻¹` `cos⁻¹` `tan⁻¹` | Funções trigonométricas inversas (modo 2nd) |
| `ln` `log` `log₂` | Logaritmos |
| `√x` `∛x` `x²` `x³` `xʸ` `ʸ√x` | Potências e raízes |
| `eˣ` `10ˣ` | Exponenciais |
| `n!` | Fatorial |
| `1/x` `abs` | Recíproco e valor absoluto |
| `π` `e` | Constantes matemáticas |

### Modos
- **DEG / RAD** — alterna entre graus e radianos para funções trigonométricas
- **2nd** — exibe funções científicas alternativas (inversas, cúbicas, raiz y)

## Como rodar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

O app estará disponível em `http://localhost:5173`.
