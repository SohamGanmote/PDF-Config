import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PDFPreview = () => {
	const [config, setConfig] = useState({});
	const [selectedText, setSelectedText] = useState(null);
	const [showEditBox, setShowEditBox] = useState(false);
	const [editText, setEditText] = useState("");
	const pdfContainerRef = useRef(null);
	const editBoxRef = useRef(null);

	useEffect(() => {
		fetch("http://localhost:8000/pdf-config")
			.then((response) => response.json())
			.then((data) => setConfig(data))
			.catch((error) => console.error("Error fetching PDF config:", error));
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (editBoxRef.current && !editBoxRef.current.contains(event.target)) {
				setShowEditBox(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleDrag = (e, data, key) => {
		setConfig((prevConfig) => ({
			...prevConfig,
			[key]: {
				...prevConfig[key],
				x: data.x,
				y: data.y,
			},
		}));
	};

	const handleColorChange = (event) => {
		const { value } = event.target;
		if (selectedText) {
			setConfig((prevConfig) => ({
				...prevConfig,
				[selectedText]: {
					...prevConfig[selectedText],
					color: value,
				},
			}));
		}
	};

	const handleFontSizeChange = (event) => {
		const { value } = event.target;
		if (selectedText) {
			setConfig((prevConfig) => ({
				...prevConfig,
				[selectedText]: {
					...prevConfig[selectedText],
					fontSize: parseInt(value, 10),
				},
			}));
		}
	};

	const handleBoldToggle = () => {
		if (selectedText) {
			setConfig((prevConfig) => {
				const currentStyles = JSON.parse(
					prevConfig[selectedText].styles || "{}"
				);
				return {
					...prevConfig,
					[selectedText]: {
						...prevConfig[selectedText],
						styles: JSON.stringify({
							...currentStyles,
							fontWeight:
								currentStyles.fontWeight === "bold" ? "normal" : "bold",
						}),
					},
				};
			});
		}
	};

	const handleTextEdit = (event) => {
		const { value } = event.target;
		setEditText(value);
		if (selectedText) {
			setConfig((prevConfig) => ({
				...prevConfig,
				[selectedText]: {
					...prevConfig[selectedText],
					value,
				},
			}));
		}
	};

	const handleTextSelection = (key) => {
		setSelectedText(key);
		setEditText(config[key]?.value || "");
		setShowEditBox(true);
	};

	const addTextBox = () => {
		const newTextKey = `text${Object.keys(config).length + 1}`;
		setConfig((prevConfig) => ({
			...prevConfig,
			[newTextKey]: {
				type: "text",
				value: "text box",
				x: 173,
				y: 516,
				fontSize: 13,
				color: "#1A4870",
				styles: "",
			},
		}));
	};

	const deleteTextBox = () => {
		if (selectedText) {
			setConfig((prevConfig) => {
				const { [selectedText]: _, ...newConfig } = prevConfig;
				return newConfig;
			});
			setShowEditBox(false);
		}
	};

	const saveConfig = () => {
		fetch("http://localhost:8000/update-pdf-config", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(config),
		}).catch((error) => console.error("Error saving PDF config:", error));
	};

	const downloadPDF = () => {
		if (pdfContainerRef.current) {
			const scale = 3;
			html2canvas(pdfContainerRef.current, { scale }).then((canvas) => {
				const imgData = canvas.toDataURL("image/jpeg", 1.0);
				const pdf = new jsPDF("p", "mm", "a4");
				const pdfWidth = pdf.internal.pageSize.width;
				const pdfHeight = pdf.internal.pageSize.height;

				const imgWidth = canvas.width;
				const imgHeight = canvas.height;
				const ratio = imgWidth / imgHeight;

				let imgScaledWidth = pdfWidth;
				let imgScaledHeight = pdfWidth / ratio;

				if (imgScaledHeight > pdfHeight) {
					imgScaledHeight = pdfHeight;
					imgScaledWidth = pdfHeight * ratio;
				}

				pdf.addImage(imgData, "JPEG", 0, 0, imgScaledWidth, imgScaledHeight);
				pdf.save("document.pdf");
			});
		}
	};

	const generatePDFCode = () => {
		// Define the code lines for generating the PDF
		const codeLines = [
			"const generatePDF = () => {",
			"  const pdf = new jsPDF('portrait');",
			"  pdf.setFontSize(8);",
		];

		Object.keys(config).forEach((key) => {
			const { value, x, y, fontSize, color, styles } = config[key];

			// const adjustedX = x - x * 0.74;
			// const adjustedY = y - y * 0.728;
			// `  pdf.setFontSize(${fontSize - fontSize * 0.2});`,

			const adjustedX = x;
			const adjustedY = y;

			// Extract and apply styles
			const textWeight = JSON.parse(styles || "{}").fontWeight || "normal";
			codeLines.push(
				`  pdf.setFontSize(${fontSize});`,
				`  pdf.setTextColor('${color}');`,
				`  pdf.text('${value}', ${adjustedX.toFixed(2)}, ${adjustedY.toFixed(
					2
				)}, {fontWeight : '${textWeight}' });`
			);
		});

		codeLines.push("	pdf.save('testPDF.pdf');");
		codeLines.push("};");
		return codeLines.join("\n");
	};

	const copyCodeToClipboard = () => {
		const code = generatePDFCode();
		navigator.clipboard.writeText(code).then(
			() => {
				alert("Code copied to clipboard!");
			},
			(err) => {
				console.error("Failed to copy code: ", err);
			}
		);
	};

	return (
		<>
			<div style={{ margin: "20px" }}>
				<button onClick={addTextBox} style={{ marginRight: "10px" }}>
					Add Text Box
				</button>
				<button onClick={saveConfig} style={{ marginRight: "10px" }}>
					Save Changes
				</button>
				<button onClick={downloadPDF} style={{ marginRight: "10px" }}>
					Download PDF
				</button>
				<button onClick={copyCodeToClipboard}>Copy Code</button>
			</div>
			{showEditBox && selectedText && (
				<div
					ref={editBoxRef}
					style={{
						position: "fixed",
						top: "10px",
						right: "10px",
						backgroundColor: "#fff",
						border: "1px solid #ccc",
						padding: "10px",
						borderRadius: "5px",
						boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
						zIndex: 1000,
					}}
				>
					<div>
						<label>
							Text:{" "}
							<input
								type="text"
								value={editText}
								onChange={handleTextEdit}
								style={{ marginLeft: "5px" }}
							/>
						</label>
					</div>
					<div style={{ marginTop: "10px" }}>
						<label>
							Text Color:{" "}
							<input
								type="color"
								value={config[selectedText]?.color || "#000000"}
								onChange={handleColorChange}
								style={{ marginLeft: "5px" }}
							/>
						</label>
					</div>
					<div style={{ marginTop: "10px" }}>
						<label>
							Font Size:{" "}
							<input
								type="number"
								min="1"
								value={config[selectedText]?.fontSize || "13"}
								onChange={handleFontSizeChange}
								style={{ marginLeft: "5px" }}
							/>
						</label>
					</div>
					<div style={{ marginTop: "10px" }}>
						<button onClick={handleBoldToggle}>Toggle Bold</button>
					</div>
					<div style={{ marginTop: "10px" }}>
						<button onClick={deleteTextBox} style={{ marginRight: "10px" }}>
							Delete Text Box
						</button>
					</div>
				</div>
			)}
			<div
				ref={pdfContainerRef}
				style={{
					position: "relative",
					width: "794px",
					height: "1123px",
					border: "1px solid #000",
					boxSizing: "border-box",
					backgroundColor: "#fff",
					overflow: "hidden",
					margin: "0 auto",
				}}
			>
				{Object.keys(config).map((key) => {
					const { value, x, y, fontSize, color, styles } = config[key];
					return (
						<Draggable
							key={key}
							defaultPosition={{ x: x * 3.3, y: y * 3 }}
							onStop={(e, data) => handleDrag(e, data, key)}
						>
							<div
								onClick={() => handleTextSelection(key)}
								style={{
									position: "absolute",
									color,
									fontSize: fontSize * 1.4,
									textAlign: JSON.parse(styles || "{}").align,
									fontFamily: JSON.parse(styles || "{}").font,
									fontWeight: JSON.parse(styles || "{}").fontWeight,
									whiteSpace: "nowrap",
									cursor: "pointer",
								}}
							>
								{value}
							</div>
						</Draggable>
					);
				})}
			</div>
		</>
	);
};

export default PDFPreview;
