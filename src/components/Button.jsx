export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`button-${variant} ${className}`.trim()} type={props.type || 'button'} {...props}>
      {children}
    </button>
  )
}
