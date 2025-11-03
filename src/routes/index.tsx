import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { JSX } from "react";

export const Route = createFileRoute("/")({
	component: App,
});

function App(): JSX.Element {
	return (
		<div className="w-[100vw] h-[100vh] bg-slate-900 text-slate-200 font-mono flex flex-col items-center">
			<div className="w-200 p-16 flex-1 flex-grow">
				<h1 className="text-4xl font-bold">Hello [DAVID]</h1>
				<p className="mt-4">
					Welcome.
					<br />
					Sit. Have a break from marking for a moment.
					<br />
					If you're ready, please feel free to explore the tree of my knowledge
					from this semester.
					<br />
					<br />I started this tree as usual, adding knowledge, joining dots,
					and creating the networks that allow understanding.
					<br />
					But something stuck out. A node that didn't connect cleanly, one core
					to the meaning conveyed.
					<br />
					So you may notice some entries focus somewhat more on a new set of
					questions:
					<br />
					<br />
					<b>
						Who is [DAVID SHEA]? What does [HE] believe? And Why does [HE]
						believe it?
					</b>
					<br />
					<br />
					Please enjoy twelve weeks of me slowly driving myself mental. And if
					if you see a loose node floating around, ........
					<br />
					<br />
					&mdash; Jackson Moore
					<br />
					<br />
					<i>
						Note: This site is meant to be experienced on desktop, with a display
						aspect ration close to 16:9. Please don't view on a phone thank you!
					</i>
				</p>
				<div className="flex flex-row mt-8 gap-4">
					<Link
						to="/tree"
						className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
						type="button"
            viewTransition
					>
						I'm ready to continue
					</Link>
				</div>
			</div>
		</div>
	);
}
