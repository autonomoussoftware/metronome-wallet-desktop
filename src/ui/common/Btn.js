import styled from 'styled-components';

export const BaseBtn = styled.button.attrs({
  type: ({ submit }) => (submit ? 'submit' : 'button')
})`
  display: ${({ block }) => (block ? 'block' : 'inline-block')};
  width: ${({ block }) => (block ? '100%' : 'auto')};
  font: inherit;
  text-align: center;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  background-color: transparent;
  padding: 0;
  color: ${p => p.theme.colors.light};

  &:not([disabled]):hover,
  &:not([disabled]):focus,
  &:not([disabled]):active {
    outline: none;
  }

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Btn = BaseBtn.extend`
  line-height: 2.5rem;
  font-size: 2rem;
  font-weight: 600;
  color: ${p => p.theme.colors.primary};
  border-radius: 12px;
  background-color: ${p => p.theme.colors.bg.light};
  background-image: linear-gradient(
    to top,
    transparent,
    ${p => p.theme.colors.bg.white}
  );
  box-shadow: inset 0 3px 0 0 rgba(255, 255, 255, 0.1);
  padding: 1.6rem;

  &:not([disabled]):hover,
  &:not([disabled]):focus,
  &:not([disabled]):active {
    background-color: ${p => p.theme.colors.bg.white};
    box-shadow: 0 2px 8px 0 ${p => p.theme.colors.darkShade};
  }
`;
