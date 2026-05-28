import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Testimonial10Props {
  className?: string;
  quote?: string;
  hideAuthor?: boolean;
  author?: {
    name: string;
    role: string;
    avatar: {
      src: string;
      alt: string;
      className?: string;
    };
  };
}

const Testimonial10 = ({
  className,
  quote = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig doloremque mollitia fugiat omnis! Porro facilis quo animi consequatur. Explicabo.",
  hideAuthor = false,
  author = {
    name: "Customer Name",
    role: "Role",
    avatar: {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
      alt: "Customer Name",
    },
  },
}: Testimonial10Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <p className="mb-10 max-w-4xl px-6 text-base font-medium leading-8 md:text-lg lg:text-2xl">
            &ldquo;{quote}&rdquo;
          </p>
          {!hideAuthor ? (
            <div className="flex items-center gap-2 md:gap-4">
              <Avatar className="size-12 md:size-16">
                <AvatarImage
                  src={author.avatar.src}
                  alt={author.avatar.alt}
                  className={author.avatar.className}
                />
                <AvatarFallback>{author.name}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium md:text-base">{author.name}</p>
                <p className="text-sm text-muted-foreground md:text-base">
                  {author.role}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export { Testimonial10 };
