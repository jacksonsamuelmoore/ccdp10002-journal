import ReturnLink from "@/components/ReturnLink";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/weeks/1")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="font-serif m-20">
			<ReturnLink />
			<h1 className="text-4xl">Welcome to Week 1!</h1>
			<p className="max-w-lg">
				This week we stripped back the layers of the onion of this subject, and
				inline with that I've started with the absolute basics. Just raw plain
				HTML.
				<br />
				<br />
				Reminiscent of the early days of the web, it's connected to the
				beginnings of this subject in two ways - first, it comes directly from
				the time of 'progress progress progress', when any 'web 2.0' startup
				could make billions. It would be this attitude that evenutally lead to
				the catastripci telecom crash - we found out fast that the attitiudes
				and idoologies we held no longer would work in the future.
				<br />
				<br />
				The more subtle connection is the <i>world wide web</i>. This was the
				beginning of what is now the largest networks of human knowledge and
				connection ever created. Looking later at biomimicry, I even had trouble
				fitting the net into a clean category - it's human made, yes, but it's
				also predicated on billions of humans interacting with it in thy way
				they want to, shifting the whole piece by piece. If that isn't a living
				organism I don't know what is! I've found that the world wide web serves
				almost everpresently as a prime example of the types of multidisiplenary
				ideas that came from this subject.
			</p>
		</div>
	);
}
