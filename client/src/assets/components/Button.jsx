const Button = ({ 
  icon,
  name = "Click me", 
  link = "#", 
  as = "link", // "link", "button", "submit"
  onClick,
  className = "",
  ...props 
}) => {
  
  const baseClass = `bg-zinc-100 p-3 text-zinc-900 hover:bg-zinc-700 hover:text-zinc-100 font-bold rounded-2xl mt-3 transition-colors duration-200 flex items-center gap-2 ${className}`
  
  // Content dengan icon dan text
  const content = (
    <>
      {icon && icon}
      {name}
    </>
  )
  
  if (as === "submit") {
    return <button type="submit" className={baseClass} onClick={onClick} {...props}>{content}</button>
  }
  
  if (as === "button") {
    return <button type="button" className={baseClass} onClick={onClick} {...props}>{content}</button>
  }
  
  return <a href={link} className={baseClass} {...props}>{content}</a>
}

export default Button