import { useState } from "react";
import Exercise from "../../components/Exercise";

const ExerciseScreen = () => {
    const [exId, setExId] = useState();

    return (
        <>
            <Exercise setExId={setExId} />
        </>
    );
}

export default ExerciseScreen;