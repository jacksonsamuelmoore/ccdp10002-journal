import ReturnLink from "@/components/ReturnLink";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/weeks/4")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="w-screen h-screen">
			<div
				className="absolute bg-slate-800
      rounded-xl text-slate-100 right-50 top-20 p-4 text-right drop-shadow-2xl max-w-md z-10"
			>
				<ReturnLink />
				<h1 className="text-3xl font-bold mb-4">Perspective</h1>
				<p className="text-md">
					This is the view from the eifel tower. Please, pan around and have a
					look.
					<br />
					Something discussed in the week four tutorial really wormed its way
					into my brain - that the building of the eifel tower was the first
					time french people had ever seen france from that height. That the
					change in perspective was a contributing factor in the 20th century
					idology of power over the world and absolute correctness.
				</p>
			</div>
			<iframe
				src="https://www.google.com/maps/embed?pb=!4v1554566802503!6m8!1m7!1sIbUm5uP_Ccl4YeLaUgvrgg!2m2!1d48.85844806901689!2d2.294475579541943!3f242.31367564127643!4f-11.854280948267316!5f0.7820865974627469"
				width="100%"
				height="100%"
				frameborder="0"
				allowfullscreen=""
			></iframe>
		</div>
	);
}
