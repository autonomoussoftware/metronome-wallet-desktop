import styled from 'styled-components';

export default styled.button.attrs({
  type: ({ submit }) => (submit ? 'submit' : 'button')
})`
  margin-top: ${({ m, mt, my, theme }) =>
    theme.spacing * (m || mt || my || 0) + 'rem'};
  margin-bottom: ${({ m, mb, my, theme }) =>
    theme.spacing * (m || mb || my || 0) + 'rem'};
  margin-left: ${({ m, ml, mx, theme }) =>
    theme.spacing * (m || ml || mx || 0) + 'rem'};
  margin-right: ${({ m, mr, mx, theme }) =>
    theme.spacing * (m || mr || mx || 0) + 'rem'};
  display: ${({ block }) => (block ? 'block' : 'inline-block')};
  width: ${({ block }) => (block ? '100%' : 'auto')};
  font: inherit;
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
  color: ${p => p.theme.colors.primary};
  line-height: 2.5rem;
  padding: 1.6rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
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
