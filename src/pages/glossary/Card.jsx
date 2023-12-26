import Link from "@docusaurus/Link";

function Card({ title, subtitle, link }) {
  return (
    <Link to={link} className="hover:no-underline">
      {/* <div className="hover:bg-slate-50/70 hover:dark:bg-slate-800/50 cursor-pointer p-4 rounded-md text-black">
        <h3>{title}</h3>
        <div className="mt-2 mb-4 prose prose-slate prose-a:relative prose-a:z-10 dark:prose-dark line-clamp-2">{subtitle}</div>
        <hr className="mt-6 mb-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:opacity-100" />
      </div> */}

      <div class="card">
        <div class="card__header">
          <h3>{title}</h3>
        </div>
        <div class="card__body">
          <p>{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

export default Card;
