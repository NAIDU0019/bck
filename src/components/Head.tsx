
import { Helmet } from "react-helmet";

interface HeadProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const Head = ({
  title = "ADHYAA PICKLES - Premium Handcrafted Pickles",
  description = "ADHYAA PICKLES - Premium quality vegetarian and non-vegetarian pickles made with authentic recipes.",
  children,
}: HeadProps) => {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {children}
    </Helmet>
  );
};

export default Head;


