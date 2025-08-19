import { useEffect, useRef } from "react";
import JXG from "jsxgraph";

export const GraphComponent = () => {
    const boardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!boardRef.current) {
            console.log("no board")
            return;
        }

        const board = JXG.JSXGraph.initBoard(boardRef.current, {
            boundingbox: [-5, 5, 5, -5],
            axis: true,
        });
        console.log(boardRef.current)

        board.create("functiongraph", [(x: number) => x*5 + 10]);

        return () => {
            JXG.JSXGraph.freeBoard(board);
        };
    }, []);

    return (
        <>
            <div
                id="jxgbox"
                ref={boardRef}
                style={{ width: "600px", height: "400px" }}
            />

        </>
    );
};

export default GraphComponent;
