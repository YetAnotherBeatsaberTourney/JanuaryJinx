import './bracket.css';

function Bracket() {
    return (
        <div className="container">
            <iframe 
                title="ChalloneBracket"
                src="https://challonge.com/JanuaryJinx25/module"
                className="bracket"
                allowTransparency={true}
                frameBorder={"1"}
                scrolling="auto"
                style={{
                    width: "72%",
                    height: "100%",
                    border: "none",
                    WebkitMaskImage: "linear-gradient(to right, black 50%, black 60%, transparent 70%)",
                    maskImage: "linear-gradient(to right, black 50%, black 60%, transparent 70%)",
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                }}
            ></iframe>
        </div>
    );
}

export default Bracket;
