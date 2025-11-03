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
				<div className="absolute inset-0 flex max-w-200 justify-center p-8">
					<div className="text-left space-y-4 mix-blend-difference max-w-200">
						<Link to="/tree" className="text-white underline">← Return to the tree</Link>
						<h1 className="text-6xl font-bold text-white ">perspective</h1>
						<p className="text-1xl text-yellow-300 hue-rotating-text2">
							The text on this page is likely hard to read. This is on purpose.
							... perspective.
							<br />
							It harkened back to one of the earliest
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
