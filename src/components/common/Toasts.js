import { ToastContainer, Flip, toast as toastify } from 'react-toastify'
import styled, { createGlobalStyle } from 'styled-components'
import React from 'react'

const GlobalStyles = createGlobalStyle`
  .Toastify__toast-container {
    z-index: 9999;
    position: fixed;
    width: 32rem;
  }

  .Toastify__toast-container--bottom-center {
    bottom: 1rem;
    left: 50%;
    margin-left: -16rem;
  }

  .Toastify__toast {
    position: relative;
    margin-bottom: 1rem;
    cursor: pointer;
  }

  /* required for autoClose feature to actually work */
  @keyframes Toastify__trackProgress {}
  .Toastify__progress-bar { animation: Toastify__trackProgress linear 1; }
  
  @keyframes Toastify__flipIn {
    from {
      transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
      animation-timing-function: ease-in;
      opacity: 0;
    }
    40% {
      transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
      animation-timing-function: ease-in;
    }
    60% {
      transform: perspective(400px) rotate3d(1, 0, 0, 10deg);
      opacity: 1;
    }
    80% {
      transform: perspective(400px) rotate3d(1, 0, 0, -5deg);
    }
    to {
      transform: perspective(400px);
    }
  }

  @keyframes Toastify__flipOut {
    from {
      transform: perspective(400px);
    }
    30% {
      transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
      opacity: 1;
    }
    to {
      transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
      opacity: 0;
    }
  }

  .Toastify__flip-enter { animation-name: Toastify__flipIn; }

  .Toastify__flip-exit { animation-name: Toastify__flipOut; }
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.6rem;
  min-height: 6rem;
  background-color: ${p => p.theme.colors.dark};
  border-radius: 2px;
  font-size: 1.6rem;
  box-shadow: 0 0 1.6rem 0 ${p => p.theme.colors.darkShade};

  .Toastify__toast--default & {
    border-top: 4px solid ${p => p.theme.colors.primary};
  }

  .Toastify__toast--success & {
    border-top: 4px solid ${p => p.theme.colors.success};
  }

  .Toastify__toast--error & {
    border-top: 4px solid ${p => p.theme.colors.danger};
  }

  &:hover {
    opacity: 0.9;
  }
`

export const toast = (content, options) =>
  toastify(<Container>{content}</Container>, options)

toast.success = (content, options) =>
  toast(content, { ...options, type: toastify.TYPE.SUCCESS })

toast.error = (content, options) =>
  toast(content, { ...options, type: toastify.TYPE.ERROR })

toast.isActive = id => toastify.isActive(id)

export const Toasts = () => (
  <React.Fragment>
    <ToastContainer
      hideProgressBar
      closeButton={false}
      newestOnTop
      transition={Flip}
      position="bottom-center"
    />
    <GlobalStyles />
  </React.Fragment>
)
