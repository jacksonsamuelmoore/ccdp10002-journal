import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/weeks/1")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="font-serif m-4">
			<h1 className="text-4xl">Welcome to Week 1!</h1>
      <p>
        This week we start from the very beginning. <br />
        I hadn't even formed my thesial question .
      </p>
		</div>
	);
}
