import React from 'react';
import ReactLoading from 'react-loading';


export default function Loader({text}) {
	return (

		<div className="loader">
			<p style={{fontSize: "30px", color: "purple"}}className="loadingText">{text}</p>
			<ReactLoading type={"spin"} color={"purple"} width={100} height={100} />
		</div>
	)
}