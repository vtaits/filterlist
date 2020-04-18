import styled from 'styled-components';

type ButtonType = 'default' | 'danger';

type Props = {
  buttonType?: ButtonType;
};

const mapTypeToColor: Record<ButtonType, string> = {
  default: '#666',
  danger: '#f44336',
};

const Button = styled.button(({
  buttonType = 'default',
}: Props) => {
  const baseColor = mapTypeToColor[buttonType];

  return {
    cursor: 'pointer',
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    fontSize: 16,
    borderStyle: 'solid',
    borderWidth: 2,
    outline: 'none',
    color: baseColor,
    borderColor: baseColor,
    transition: 'all 0.15s',
    paddingLeft: 20,
    paddingRight: 20,

    '&:hover': {
      backgroundColor: baseColor,
      color: '#fff',
    },

    '&:active': {
      opacity: 0.75,
    },
  };
});

export default Button;
