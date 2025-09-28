const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "index.html");
let content = fs.readFileSync(filePath, "utf8");

// Replace all instances of the hyphenated options with non-hyphenated ones
content = content.replace(/value="Qt-Wt">Qt-Wt/g, 'value="QtWt">QtWt');
content = content.replace(/value="Wt-Et">Wt-Et/g, 'value="WtEt">WtEt');
content = content.replace(/value="Et-Rt">Et-Rt/g, 'value="EtRt">EtRt');
content = content.replace(/value="Rt-Tt">Rt-Tt/g, 'value="RtTt">RtTt');
content = content.replace(/value="Tt-Yt">Tt-Yt/g, 'value="TtYt">TtYt');
content = content.replace(/value="Yt-Ut">Yt-Ut/g, 'value="YtUt">YtUt');
content = content.replace(/value="Ut-Pt">Ut-Pt/g, 'value="UtPt">UtPt');
content = content.replace(/value="Pt-At">Pt-At/g, 'value="PtAt">PtAt');
content = content.replace(/value="At-St">At-St/g, 'value="AtSt">AtSt');
content = content.replace(/value="St-Dt">St-Dt/g, 'value="StDt">StDt');
content = content.replace(/value="Dt-Ft">Dt-Ft/g, 'value="DtFt">DtFt');
content = content.replace(/value="Ft-Gt">Ft-Gt/g, 'value="FtGt">FtGt');
content = content.replace(/value="Gt-Ht">Gt-Ht/g, 'value="GtHt">GtHt');
content = content.replace(/value="Ht-Jt">Ht-Jt/g, 'value="HtJt">HtJt');
content = content.replace(/value="Jt-Kt">Jt-Kt/g, 'value="JtKt">JtKt');
content = content.replace(/value="Lt-Zt">Lt-Zt/g, 'value="LtZt">LtZt');
content = content.replace(/value="Zt-Ct">Zt-Ct/g, 'value="ZtCt">ZtCt');
content = content.replace(/value="Ct-Vt">Ct-Vt/g, 'value="CtVt">CtVt');
content = content.replace(/value="Vt-Bt">Vt-Bt/g, 'value="VtBt">VtBt');
content = content.replace(/value="Bt-Nt">Bt-Nt/g, 'value="BtNt">BtNt');
content = content.replace(/value="Nt-Mt">Nt-Mt/g, 'value="NtMt">NtMt');

fs.writeFileSync(filePath, content);
console.log("Hyphens removed from dropdown options");
