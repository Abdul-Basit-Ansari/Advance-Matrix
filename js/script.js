window.onload = (event) => {
  Cal.random(false);
  console.log("page is fully loaded");
};
let Log = function (x) {
  Main.innerHTML += x + `<br>`;
};

class Matrix {
  constructor(x = false, y = false, z = 1) {
    if (!x) {
      let a = y ? y : (1 + 5 * Math.random()) | 0;
      x = [];
      while (x.length < a * a) {
        let c = (10 * Math.random()) | 0;
        c *= 2 * Math.random() < 1 ? 1 : -1;
        let d = (1 + 10 * Math.random()) | 0;
        d = ((1 + d * Math.random()) | 0) + "/" + (1 + d);
        d = (2 * Math.random() < 1 ? "-" : "") + d;
        x.push(2 * Math.random() < 1 ? c : d);
      }
      // y=z=a;
      y = 3;
      z = 3;
    }
    this.row = y;
    this.col = z;
    x = x.map((m) => String(m)).slice(0, y * z);
    while (x.length < y * z) x.push(0);
    this.raw = x;
    let a = [];
    while (a.length < y) {
      a.push(x.slice(0, z));
      x = x.slice(z);
    }
    this.val = a;
  }
  add(x) {
    if (this.row !== x.row || this.col !== x.col) return;
    let a = this.raw.slice();
    for (let i = 0; i < a.length; i++) a[i] = this.s(a[i], x.raw[i]);
    return new Matrix(a, this.row, this.col);
  }
  sub(x) {
    return this.add(x.mul(-1));
  }
  mul(x) {
    if (typeof x === "number" || typeof x === "string") {
      return new Matrix(
        this.raw.slice().map((m) => this.m(x, m)),
        this.row,
        this.col
      );
    }
    if (this.row !== x.col || this.col !== x.row) return;
    let a = [];
    for (let i of this.val)
      for (let j of x.transpose().val) {
        let s = "0";
        for (let k = 0; k < i.length; k++)
          //s+=i[k]*j[k];
          s = this.s(s, this.m(i[k], j[k]));
        a.push(s);
      }
    return new Matrix(a, this.row, x.col);
  }
  div(x) {
    if (this.col !== x.col || this.row !== x.row || this.col !== this.row)
      return;
    return this.mul(this, x.inverse());
  }
  transpose() {
    let a = [];
    for (let i = 0; i < this.col; i++)
      for (let j = 0; j < this.row; j++) a.push(this.val[j][i]);
    return new Matrix(a, this.col, this.row);
  }
  determinant() {
    if (this.row !== this.col) return;
    if (this.row === 2) {
      let a = this.raw;
      return this.s(this.m(a[0], a[3]), this.m(a[1], a[2]), false); //a[0]*a[3]-a[1]*a[2];
    }
    let a = "";
    for (let i = 0; i < this.col; i++) {
      let j = [];
      for (let k = 1; k < this.row; k++)
        for (let l = 0; l < this.col; l++) if (l !== i) j.push(this.val[k][l]);
      //a+=(i%2===0?1:-1)*this.val[0][i]*(new Matrix(j,this.row-1,this.row-1)).determinant();
      a = this.s(
        a,
        this.m(
          i % 2 === 0 ? 1 : -1,
          this.m(
            this.val[0][i],
            new Matrix(j, this.row - 1, this.row - 1).determinant()
          )
        )
      );
    }
    return a;
  }
  inverse() {
    if (this.row !== this.col) return;
    if (this.row === 2) {
      let a = this.raw.slice();
      [a[0], a[3]] = [a[3], a[0]];
      a[1] = this.m(a[1], -1);
      a[2] = this.m(a[2], -1);
      return new Matrix(a, this.row, this.row).mul(
        this.m(1, this.determinant(), false)
      );
    }
    let a = [];
    for (let i = 0; i < this.row; i++)
      for (let j = 0; j < this.col; j++) {
        let b = [];
        for (let k = 0; k < this.row; k++)
          for (let l = 0; l < this.col; l++)
            if (i !== k && j !== l) b.push(this.val[k][l]);
        a.push(new Matrix(b, this.row - 1, this.row - 1).determinant());
      }
    //Log(new Matrix(a,this.row,this.row).render());
    a = new Matrix(a, this.row, this.row).val;
    let b = [];
    for (let i = 0; i < a.length; i++)
      for (let j = 0; j < a[i].length; j++)
        b.push(
          this.m(
            (i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0)
              ? 1
              : -1,
            a[i][j]
          )
        );
    //Log(new Matrix(b,this.row,this.row).transpose().render());
    //Log(this.determinant());
    return new Matrix(b, this.row, this.row)
      .transpose()
      .mul(this.m(1, this.determinant(), false));
  }
  render() {
    let a = this.val;
    a = a
      .map(
        (m) =>
          `<tr>` +
          m
            .map(
              (n) =>
                `<td class=td>` +
                (n.includes("/")
                  ? `<table align=right><tr><td rowspan=2 class=frac>` +
                    (Number(n.split("/")[0]) < 0 ? `-` : ``) +
                    `</td><td class=frac style="border-bottom:1px solid">` +
                    Math.abs(n.split("/")[0]) +
                    `</td></tr><tr><td class=frac>` +
                    n.split("/")[1] +
                    `</td></tr></table>`
                  : n) +
                `</td>`
            )
            .join("") +
          `</tr>`
      )
      .join("");
    return `<table class=table align=center>` + a + `</table>`;
  }
  m(x, y, z = true) {
    x = String(x);
    y = String(y);
    if (!x.includes("/")) x += "/1";
    if (!y.includes("/")) y += "/1";
    x = x.split("/").map((m) => Number(m));
    y = y.split("/").map((m) => Number(m));
    if (!z) y = y.reverse();
    x[0] *= y[0];
    x[1] *= y[1];
    x = x.map((m) => m / this.gcd(...x));
    x = this.fixFrac(x);
    return x[0] % x[1] === 0 ? x[0] / x[1] : x.join("/");
  }
  s(x, y, z = true) {
    x = String(x);
    y = String(y);
    if (!x.includes("/")) x += "/1";
    if (!y.includes("/")) y += "/1";
    x = x.split("/").map((m) => Number(m));
    y = y.split("/").map((m) => Number(m));
    let a = [x[0] * y[1] + (z ? 1 : -1) * y[0] * x[1], x[1] * y[1]];
    a = a.map((m) => m / this.gcd(...a));
    a = this.fixFrac(a);
    return a[0] % a[1] === 0 ? a[0] / a[1] : a.join("/");
  }
  fixFrac(x) {
    if ((x[0] >= 0 && x[1] < 0) || (x[0] < 0 && x[1] < 0)) x = x.map((m) => -m);
    return x;
  }
  gcd(x, y) {
    return y === 0 ? x : this.gcd(y, x % y);
  }
}

let Cal = {
  A: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ],
  B: [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
  ],
  newDimension: function (x, y, z) {
    while (y.length !== z[0])
      if (y.length < z[0]) y.push(y[0].slice().map((m) => 0));
      else y = y.slice(0, z[0]);
    while (y[0].length !== z[1])
      if (y[0].length < z[1]) for (let i = 0; i < y.length; i++) y[i].push(0);
      else for (let i = 0; i < y.length; i++) y[i] = y[i].slice(0, z[1]);
    Cal.render(x, y);
  },
  input3: function (x) {
    let a = x.innerText;
    let b = Cal.currentEdit;
    if (!isNaN(a)) {
      let c = b.innerText + a;
      b.innerText = c[0] === "0" ? c.slice(1) : c;
      return;
    }
    if (a === "Clear") {
      let c = b.innerText.slice(0, -1);
      b.innerText = c.length === 0 ? "0" : c;
      return;
    }
    if (a === "Done") {
      if (b === A1 || b === A2) {
        let a = [A1.innerText, A2.innerText].map((m) =>
          m === "0" ? 1 : Number(m)
        );
        Cal.newDimension(A, Cal.A, a);
      }
      if (b === B1 || b === B2) {
        let a = [B1.innerText, B2.innerText].map((m) =>
          m === "0" ? 1 : Number(m)
        );
        Cal.newDimension(B, Cal.B, a);
      }
      if (b.innerText === "0") b.innerText = "1";
      b.style.background = "";
      b.style.color = "#fff";
      b.style.boxShadow = "";
      inputer2.style.display = "none";
      Cal.manualInputing = false;
      return;
    }
  },
  inputingWarning: function () {
    inputer.style.animation = "gurubug .3s";
    setTimeout(function () {
      inputer.style.animation = "";
    }, 300);
  },
  manualInputingWarning: function () {
    inputer2.style.animation = "gurubug .3s";
    setTimeout(function () {
      inputer2.style.animation = "";
    }, 300);
  },
  manualEdit: function (x) {
    for (let a of [result1, result2]) a.innerHTML = "";
    if (Cal.inputing) {
      Cal.inputingWarning();
      return;
    }
    if (Cal.manualInputing) {
      Cal.manualInputingWarning();
      return;
    }
    Cal.manualInputing = true;
    Cal.currentEdit = x;
    x.style.background = "#fff";
    x.style.color = "#222";
    x.style.boxShadow = "1px 1px 1px #222 inset";
    inputer2.style.display = "block";
  },
  td4: function (x, y = true) {
    x.style.background = y ? "#fff" : "#222";
    x.style.color = y ? "#222" : "#fff";
    x.style.boxShadow = y ? "1px 1px 1px #444 inset" : "";
  },
  inputing: false,
  input2: function (x) {
    x = x.innerText;
    y = Cal.currentInput;
    if (!isNaN(x)) {
      y.innerText += x;
      if (y.innerText.startsWith("0")) y.innerText = y.innerText.slice(1);
      return;
    }
    if (x === "Clear") {
      y.innerText = y.innerText.slice(0, -1);
      if (y.innerText.length === 0) y.innerText = "0";
      return;
    }
    if (x === "Reset") {
      y.innerText = "0";
      return;
    }
    if (x === "/") {
      let a = y.innerText;
      if (!a.includes("/") && a !== "0" && a !== "-0") y.innerText += "/";
      return;
    }
    if (x === "Done") {
      y.style.background = "#0d8fca";
      y.style.color = "#fff";
      y.style.boxShadow = "";
      let a = Cal.location;
      if (y.innerText.endsWith("/")) y.innerText = y.innerText.slice(0, -1);
      if (y.innerText.endsWith("/0")) y.innerText = y.innerText.slice(0, -2);
      if (y.innerText.endsWith("-")) y.innerText = "0";
      Cal.currentMatrix[a[0]][a[1]] = y.innerText;
      Cal.inputing = false;
      Cal.render(
        y.parentNode.parentNode.parentNode.parentNode,
        Cal.currentMatrix
      );
      inputer.style.display = "none";
    }
    if (x === "-") {
      let a = y.innerText;
      y.innerText = a[0] === "-" ? a.slice(1) : "-" + a;
      return;
    }
  },
  input: function (p, q, r, s) {
    if (p.parentNode.parentNode.parentNode.parentNode === result2) return;
    for (let a of [result1, result2]) a.innerHTML = "";
    if (Cal.inputing) {
      Cal.inputingWarning();
      return;
    }
    if (Cal.manualInputing) {
      Cal.manualInputingWarning();
      return;
    }
    Cal.inputing = true;
    Cal.currentInput = p;
    Cal.currentMatrix = q;
    Cal.location = [r, s];
    p.innerHTML = q[r][s];
    p.style.background = "#fff";
    p.style.color = "#222";
    p.style.boxShadow = "1px 1px 1px #222 inset";
    inputer.style.display = "block";
  },
  render: function (x, y) {
    let a = ``;
    for (let i = 0; i < y.length; i++) {
      let b = ``;
      for (let j = 0; j < y[i].length; j++) {
        let k = String(y[i][j]);
        if (k.includes("/"))
          k =
            `
                <table align=right style="font-size:50%;text-align:center">
                    <tr>
                        <td rowspan=2>` +
            (k[0] === `-` ? `-` : ``) +
            `</td>
                        <td style="border-bottom:1px solid">` +
            Math.abs(k.split("/")[0]) +
            `</td>
                    </tr>
                    <tr>
                        <td>` +
            Math.abs(k.split("/")[1]) +
            `</td>
                    </tr>
                </table>
                `;
        b +=
          `<td onclick=Cal.input(this,` +
          (x === A ? `Cal.A` : `Cal.B`) +
          `,` +
          i +
          `,` +
          j +
          `) style="width:25px;height:25px;text-align:right;border:1px solid #b2b2b2;padding:10px 17px">` +
          k +
          `</td>`;
      }
      a += `<tr>` + b + `</tr>`;
    }
    x.innerHTML =
      `<table align=center style="border:1px solid gray;border-collapse:collapse">` +
      a +
      `</table>`;
  },
  addCol: function (x, y = true) {
    if (Cal.inputing) {
      Cal.inputingWarning();
      return;
    }
    if (Cal.manualInputing) {
      Cal.manualInputingWarning();
      return;
    }
    for (let i of [result1, result2]) i.innerHTML = "";
    let a = x === A ? Cal.A : Cal.B;
    let b = x === A ? A2 : B2;
    if (y) {
      for (let i = 0; i < a.length; i++) a[i].push(0);
      b.innerText = a[0].length;
    } else {
      if (a[0].length === 1) return;
      for (let i = 0; i < a.length; i++) a[i].pop();
      b.innerText = a[0].length;
    }
    Cal.render(x, a);
  },
  addRow: function (x, y = true) {
    if (Cal.inputing) {
      Cal.inputingWarning();
      return;
    }
    if (Cal.manualInputing) {
      Cal.manualInputingWarning();
      return;
    }
    for (let i of [result1, result2]) i.innerHTML = "";
    let a = x === A ? Cal.A : Cal.B;
    let b = x === A ? A1 : B1;
    if (y) {
      a.push(a[0].slice().map((m) => 0));
      b.innerText = a.length;
    } else {
      if (a.length === 1) return;
      a.pop();
      b.innerText = a.length;
    }
    Cal.render(x, a);
  },
  init: function (x = Main, y = Main2) {
    let a = `
        <div class=abNav>
            <h2 style="text-align:center;margin-bottom:0px">MATRIX CALCULATOR</h2>
            <p  style="text-align:center;margin:0px">BY</p>
            <h3 style="text-align:center;margin-top:0px">ABDUL-BASIT-ANSARI</h3>
        </div>
        <table style="width:100%;">
        <tr><td class=td1>A</td></tr>
            <tr>
                <td class=td2>
                    <div>
                        <table align=center>
                            <tr>
                                <td id=A1 onclick=Cal.manualEdit(this)>3</td>
                                <td>x</td>
                                <td id=A2 onclick=Cal.manualEdit(this)>3</td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <table align=center>
                        <tr>
                            <td></td>
                            <td class=td3 onclick=Cal.addRow(A,false)>-</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td class=td3 onclick=Cal.addCol(A,false)>-</td>
                            <td id=A></td>
                            <td class=td3 onclick=Cal.addCol(A)>+</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td class=td3 onclick=Cal.addRow(A)>+</td>
                            <td></td>
                        </tr>
                    </table>
                    </div>
                </td>
            </tr>
            <tr>
            <td class=td1>B</td>
            </tr>
            <tr>
                <td class=td2>
                    <div>
                        <table align=center>
                            <tr>
                                <td id=B1 onclick=Cal.manualEdit(this)>3</td>
                                <td>x</td>
                                <td id=B2 onclick=Cal.manualEdit(this)>3</td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <table align=center>
                        <tr>
                            <td></td>
                            <td class=td3 onclick=Cal.addRow(B,false)>-</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td class=td3 onclick=Cal.addCol(B,false)>-</td>
                            <td id=B></td>
                            <td class=td3 onclick=Cal.addCol(B)>+</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td class=td3 onclick=Cal.addRow(B)>+</td>
                            <td></td>
                        </tr>
                    </table>
                    </div>
                </td>
            </tr>
            <tr>
            <td class=td1 id=result1></td>
            </tr>
            <tr>
                <td class=td2 id=result2 onclick=Cal.assign0(this) style="padding:10px"></td>
            </tr>
        </table>
        `;
    x.innerHTML = a;

    a = `
        <div id=pad1>
            <table align=center class="commandBox">
            <tr>
                <td onclick=Cal.compute(this) class=pad5>A + B</td>
                <td onclick=Cal.compute(this) class=pad5>A * B</td>
                <td onclick=Cal.compute(this) class=pad5>A<sup>T</sup></td>
                </tr>
                <tr>
                <td onclick=Cal.compute(this) class=pad5>A<sup>-1</sup></td>
                <td onclick=Cal.compute(this) class=pad5>|A|</td>
                <td onclick=Cal.compute(this) class=pad5>A - B</td>
                </tr>
                <tr>
                <td onclick=Cal.compute(this) class=pad5>A : B</td>
                <td onclick=Cal.compute(this) class=pad5>B<sup>T</sup></td>
                <td onclick=Cal.compute(this) class=pad5>B<sup>-1</sup></td>
                </tr>
                <tr>
                <td onclick=Cal.compute(this) class=pad5>|B|</td>
                <td onclick=Cal.random(false) class=pad5 ontouchstart=Cal.t(this) ontouchend=Cal.t(this,false)>Reset</td>
                <td onclick=Cal.random() class=pad5 ontouchstart=Cal.t(this) ontouchend=Cal.t(this,false)>Random</td>
            </tr>
            <tr>
            <td colspan=5>
            <button onclick=Cal.hide() class=pad4 ontouchstart=Cal.t(this) ontouchend=Cal.t(this,false)>Hide</button>
            </td>
            </tr>
        </table>
        </div>
        <table id=commands onclick=Cal.hide(false)>
            <tr>
                <td class=comm></td>
                <td class=comm></td>
            </tr>
            <tr>
                <td class=comm></td>
                <td class=comm></td>
            </tr>
        </table>
        <div id=assign>
            <div class=assign onclick=Cal.assign(Cal.A,A) ontouchstart=Cal.t(this) ontouchend=Cal.t(this,false)>Set as A</div>
            <div class=assign onclick=Cal.assign(Cal.B,B) ontouchstart=Cal.t(this) ontouchend=Cal.t(this,false)>Set as B</div>
            <div class=assign onclick=Cal.random(false) ontouchstart=Cal.t(this) ontouchend=Cal.t(this,false)>Reset</div>
            <div class=assign onclick="assign.style.display='none'" ontouchstart=Cal.t(this) ontouchend=Cal.t(this,false)>Hide</div>
        </div>
        <table id=inputer align=center class=inputer></table>
        <table id=inputer2 align=center class=inputer></table>
        `;
    y.innerHTML = a;

    a = ``;
    for (let i of ["123", "456", "789", "-0/", ["Reset", "Done", "Clear"]]) {
      let b = ``;
      for (let j of i)
        b +=
          `<td class=td4 onclick=Cal.input2(this) ontouchstart=Cal.td4(this) ontouchend=Cal.td4(this,false)>` +
          j +
          `</td>`;
      a += `<tr>` + b + `</tr>`;
    }
    inputer.innerHTML = a;
    inputer.ontouchmove = function (x) {
      let touch = x.targetTouches[0];
      x.currentTarget.style.left = touch.pageX - 70 + "px";
      x.currentTarget.style.top = touch.pageY - 70 + "px";
    };

    a = ``;
    for (let i of ["123", "456", "789", ["Done", "0", "Clear"]]) {
      let b = ``;
      for (let j of i)
        b +=
          `<td class=td4 onclick=Cal.input3(this) ontouchstart=Cal.td4(this) ontouchend=Cal.td4(this,false)>` +
          j +
          `</td>`;
      a += `<tr>` + b + `</tr>`;
    }
    inputer2.innerHTML = a;
    inputer2.ontouchmove = function (x) {
      let touch = x.targetTouches[0];
      x.currentTarget.style.left = touch.pageX - 70 + "px";
      x.currentTarget.style.top = touch.pageY - 70 + "px";
    };

    a = (2 + 4 * Math.random()) | 0;
    Cal.A = new Matrix(false, a).val;
    Cal.B = new Matrix(false, a).val;
    Cal.render(A, Cal.A);
    Cal.render(B, Cal.B);
    for (let i of [A1, A2, B1, B2]) i.innerText = a;
  },
  t: function (x, y = true) {
    x.style.background = y ? "#fff" : "#0d8fca";
    x.style.color = y ? "#0d8fca" : "#fff";
    x.style.boxShadow = y ? "1px 1px 1px #000 inset" : "";
  },
  transform: function (x) {
    let a = [];
    for (let i of x) for (let j of i) a.push(j);
    return new Matrix(a, x.length, x[0].length);
  },
  compute: function (x) {
    if (Cal.inputing) {
      Cal.inputingWarning();
      return;
    }
    if (Cal.manualInputing) {
      Cal.manualInputingWarning();
      return;
    }
    let y = x.innerHTML;
    x = x.innerText;

    let a = Cal.transform(Cal.A);
    let b = Cal.transform(Cal.B);
    let c;
    if (x.includes("+") || (x.includes("-") && !x.includes("1")))
      c = a.add(x.includes("+") ? b : b.mul(-1));
    else if (x.includes("*")) c = a.mul(b);
    else if (x.includes(":"))
      c = b.inverse() ? a.mul(b.inverse()) : "B has 0 determinant";
    else if (x.includes("T")) c = (x.includes("A") ? a : b).transpose();
    else if (x.includes("-1")) c = (x.includes("A") ? a : b).inverse();
    else if (x.includes("|")) c = (x.includes("A") ? a : b).determinant();
    c =
      c === undefined
        ? "Unsuitable length of rows or columns or illegal operation"
        : c;
    result1.innerHTML = y;
    if (typeof c === "object") {
      Cal.render(result2, c.val);
      Cal.result = c;
    } else result2.innerHTML = c;
    Main.scrollTop = Main.scrollHeight;
    Cal.hide();
    return;
  },
  random: function (x = true) {
    result1.innerText = "";
    result2.innerHTML = "";
    if (Cal.inputing) {
      Cal.inputingWarning();
      return;
    }
    if (Cal.manualInputing) {
      Cal.manualInputingWarning();
      return;
    }
    if (x) {
      let a = (1 + 5 * Math.random()) | 0;
      Cal.A = new Matrix(false, a).val;
      Cal.B = new Matrix(false, a).val;
      for (let b of [A1, A2, B1, B2]) b.innerText = a;
    } else {
      Cal.A = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      Cal.B = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      for (let b of [A1, A2, B1, B2]) b.innerText = 3;
      pad1.style.top = "80%";
      pad1.style.left = 0;
      assign.style.display = "none";
    }
    Cal.render(A, Cal.A);
    Cal.render(B, Cal.B);
  },
  hide: function (x = true) {
    pad1.style.display = x ? "none" : "block";
    commands.style.display = x ? "block" : "none";
    if (!x) assign.style.display = "none";
  },
  assign0: function (x) {
    if (!x.innerHTML.includes("table")) return;
    pad1.style.display = "none";
    assign.style.display = "block";
    commands.style.display = "block";
  },
  assign: function (x, y) {
    x = Cal.result.val;
    if (y === A) Cal.A = x;
    else Cal.B = x;
    Cal.render(y, x);
    for (let i of [result1, result2]) i.innerHTML = "";
    assign.style.display = "none";
  },
};

Cal.init();
let a = new Matrix(["4/6", "-6/8", "-1/2", 0], 2, 2);
