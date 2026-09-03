import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

export default function CatalogImage({ src, alt, className, priority, sizes, fill, width, height }: Props) {
  if (src.startsWith("sprite:")) {
    const [, columnValue, rowValue] = src.split(":");
    const column = Number(columnValue);
    const row = Number(rowValue);
    return (
      <span
        role="img"
        aria-label={alt}
        className={`catalog-sprite-image${fill ? " catalog-sprite-fill" : ""}${className ? ` ${className}` : ""}`}
        style={{
          width: fill ? undefined : width,
          height: fill ? undefined : height,
          backgroundPosition: `${(column / 19) * 100}% ${(row / 40) * 100}%`,
        }}
      />
    );
  }

  return <Image src={src} alt={alt} className={className} priority={priority} sizes={sizes} fill={fill} width={width} height={height} />;
}
