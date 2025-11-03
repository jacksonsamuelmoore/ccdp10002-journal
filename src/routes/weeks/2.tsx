import ReturnLink from "@/components/ReturnLink";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/weeks/2")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<style>{`
        @keyframes hueRotateBg {
          from {
            filter: hue-rotate(0deg);
          }
          to {
            filter: hue-rotate(360deg);
          }
        }


        @keyframes hueRotateText2 {
          from {
            filter: hue-rotate(0deg);
          }
          to {
            filter: hue-rotate(360deg);
          }
        }

        .hue-rotating-bg {
          animation: hueRotateBg 2s linear infinite;
        }


        .hue-rotating-text2 {
          animation: hueRotateText2 4s linear infinite;
        }
      `}</style>
			<div className="w-screen h-screen relative">
				<div className="absolute inset-0 hue-rotating-bg flex flex-col">
					<div className="flex flex-row flex-1">
						<div className="bg-pink-500 flex-1"></div>
						<div className="bg-blue-500 flex-2"></div>
					</div>
					<div className="flex flex-row flex-1">
						<div className="bg-orange-500 flex-2"></div>
						<div className="bg-red-500 flex-1"></div>
					</div>
				</div>
				<div className="absolute inset-0 flex max-w-2xl justify-center p-20">
					<div className="text-left text-white space-y-4 mix-blend-difference">
						<ReturnLink />
						<h1 className="text-6xl font-bold text-white ">
							the eyes aren't for seeing
						</h1>
						<p className="text-1xl text-yellow-300 hue-rotating-text2">
							The text on this page is likely hard to read. This is on purpose.
							<br />
							This page is inspired by the game 'The Witness' - a wonderful
							puzzle game about perspective. The final part of this game
							features a mind bending puzzle where the player must read text
							that is camouflaged against a colorful, constantly shifting
							background, almost optical illusion like. This is my connection to
							your oft repeated statement that 'the eyes aren't for seeing', in
							a somewhat more literal sense. To complete these puzzles, and for
							that matter properly read this text, I found that the best way is
							almost to 'shut off' my eyes. They'd still be open, but I'd
							intentionally slow the speed of information to my brain.
							<br />
							<br />
							Try it: just look at this text but widen the POV of your eyes,
							almost bluring them. I found it allows the raw information to wash
							over you, and your brain can infer and deduce much more that if it
							were constantly processing the shifting colors.
							<br />
							This the most clear example I've found of how we control our own
							perception and senses more that we know - ideas that came back
							directly in{" "}
							<Link to="/weeks/9" className="underline">
								week 9
							</Link>
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
