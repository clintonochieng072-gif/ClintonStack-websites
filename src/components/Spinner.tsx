const Spinner = ({
  size = "w-4 h-4",
  color = "border-blue-500",
}: {
  size?: string;
  color?: string;
}) => (
  <div
    className={`animate-spin rounded-full border-2 border-t-transparent ${size} ${color}`}
  ></div>
);

export default Spinner;
