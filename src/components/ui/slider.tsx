import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderImpl>,
  React.ComponentPropsWithoutRef<typeof SliderImpl>
>(({ className, ...props }, ref) => (
  <SliderImpl className={cn("relative flex w-full touch-none select-none", className)} ref={ref} {...props} />
));
Slider.displayName = "Slider";

const SliderImpl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number | number[];
    defaultValue?: number | number[];
    onChange?: (value: number | number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  }
>(({
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  ...props
}, ref) => {
  const [values, setValues] = React.useState<number[]>(
    Array.isArray(value) ? value : [value ?? defaultValue ?? 50]
  );

  const handleChange = (newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setValues(newValue);
    } else {
      setValues([newValue]);
    }
    onChange?.(newValue);
  };

  return (
    <div className={cn("relative flex w-full touch-none select-none", className)} {...props}>
      <div className="relative flex flex-col w-full">
        <div className="relative flex flex-col w-full">
          <div className="relative flex items-center w-full">
            <div className="relative flex-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full bg-gray-200 h-1 rounded-full" />
              </div>
              <motion.div
                animate={{
                  width: `${(values[0] - min) / (max - min) * 100}%`,
                }}
                className="absolute inset-0 flex items-center"
              >
                <div className="w-full bg-gold-500 h-1 rounded-full" />
              </motion.div>
              <input
                ref={ref}
                type="range"
                min={min}
                max={max}
                step={step}
                value={values[0]}
                onChange={(e) => handleChange(Number(e.target.value))}
                disabled={disabled}
                className="w-full h-1 bg-transparent cursor-pointer appearance-none focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export { Slider };
