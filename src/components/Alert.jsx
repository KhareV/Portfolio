import { spacing, layout, borders, cn } from "../styles/spacing.js";

const Alert = ({ type, text }) => {
  return (
    <div className={cn("fixed bottom-5 right-5 z-50", layout.flex.center)}>
      <div
        className={cn(
          spacing.interactive.padding,
          type === "danger" ? "bg-red-800" : "bg-blue-800",
          "items-center text-indigo-100 leading-none lg:rounded-full",
          layout.flex.center,
          "lg:inline-flex",
          borders.rounded.md
        )}
        role="alert"
      >
        <p
          className={cn(
            layout.flex.center,
            borders.rounded.full,
            type === "danger" ? "bg-red-500" : "bg-blue-500",
            "uppercase font-semibold",
            spacing.interactive.padding,
            "text-xs mr-3"
          )}
        >
          {type === "danger" ? "Failed" : "Success"}
        </p>
        <p className="mr-2 text-left">{text}</p>
      </div>
    </div>
  );
};

export default Alert;
