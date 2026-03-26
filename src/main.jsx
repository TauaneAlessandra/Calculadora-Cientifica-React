// StrictMode é um componente do React que ativa verificações extras durante
// o desenvolvimento — ele não afeta o build de produção.
// Ele ajuda a encontrar problemas como efeitos colaterais inesperados.
import { StrictMode } from 'react'

// createRoot é a função moderna do React 18+ para "montar" a aplicação
// dentro de um elemento HTML existente na página.
import { createRoot } from 'react-dom/client'

// Importa o CSS global da aplicação (reset, estilos do body, #root, etc.)
import './index.css'

// Importa o componente raiz da aplicação — é daqui que tudo começa
import App from './App.jsx'

// Busca o elemento <div id="root"> no index.html e transforma ele
// no ponto de entrada da aplicação React.
// O .render() define o que será exibido dentro desse elemento.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
