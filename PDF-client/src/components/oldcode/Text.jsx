import jsPDF from "jspdf";

const Test = () => {
	const generatePDF = () => {
		const pdf = new jsPDF("portrait");
		pdf.setFontSize(8);
		pdf.setFontSize(8);
		pdf.setTextColor("#1A4870");
		pdf.text("Est. 2016", 10.0, 10.0, { fontWeight: "normal" });
		pdf.setFontSize(8);
		pdf.setTextColor("#1A4870");
		pdf.text("Col Code: EB-0386", 200.0, 10.0, { fontWeight: "normal" });
		pdf.setFontSize(undefined);
		pdf.setTextColor("undefined");
		pdf.text("undefined", 10.0, 20.0, { fontWeight: "normal" });
		pdf.setFontSize(8);
		pdf.setTextColor("#1A4870");
		pdf.text("||SHREE VEETARAGAYA NAMAHA||", 105.0, 23.0, {
			fontWeight: "bold",
		});
		pdf.setFontSize(10);
		pdf.setTextColor("#A02334");
		pdf.text("Hajare Foundations", 105.0, 28.0, { fontWeight: "normal" });
		pdf.setFontSize(12);
		pdf.setTextColor("#A02334");
		pdf.text("PADMAVATI SCIENCE & COMMERCE PU COLLEGE, HOSUR", 105.0, 34.0, {
			fontWeight: "bold",
		});
		pdf.setFontSize(10);
		pdf.setTextColor("#1A4870");
		pdf.text(
			"TK: RABAKAVI-BANAHATTI, DIST: BAGALKOTE, KARNATAKA-587312",
			105.0,
			40.0,
			{ fontWeight: "normal" }
		);
		pdf.setFontSize(8);
		pdf.setTextColor("#1A4870");
		pdf.text("DISC CODE: 29020912602", 10.0, 46.0, { fontWeight: "normal" });
		pdf.setFontSize(8);
		pdf.setTextColor("#1A4870");
		pdf.text("www.padmavatiinstitutes.com", 200.0, 46.0, {
			fontWeight: "normal",
		});
		pdf.setFontSize(8);
		pdf.setTextColor("#1A4870");
		pdf.text("Ph. No.: 9071410105, 9739061008", 10.0, 52.0, {
			fontWeight: "normal",
		});
		pdf.setFontSize(8);
		pdf.setTextColor("#1A4870");
		pdf.text("E-mail: padmavatipucollege@gmail.com", 200.0, 52.0, {
			fontWeight: "normal",
		});
		pdf.save("testPDF.pdf");
	};
	return (
		<>
			<button onClick={generatePDF}>generatePDF</button>
		</>
	);
};
export default Test;
