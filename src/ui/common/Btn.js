import styled from 'styled-components';

export default styled.button.attrs({
  type: ({ submit }) => (submit ? 'submit' : 'button')
})`
  display: ${({ block }) => (block ? 'block' : 'inline-block')};
  width: ${({ block }) => (block ? '100%' : 'auto')};
  font: inherit;
  ${p => p.theme.text.normal};
  color: ${p => p.theme.colors.primary};
  text-align: center;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  background-color: ${p => p.theme.colors.bg.light};
  background-image: linear-gradient(
    to top,
    transparent,
    ${p => p.theme.colors.bg.white}
  );
  box-shadow: inset 0 3px 0 0 rgba(255, 255, 255, 0.1);
  padding: 1.6rem;
  transition: 0.3s;

  &:not([disabled]):hover,
  &:not([disabled]):focus,
  &:not([disabled]):active {
    background-color: ${p => p.theme.colors.bg.white};
    box-shadow: 0 2px 8px 0 ${p => p.theme.colors.shade};
    outline: none;
  }

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
