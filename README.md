# Sliding Puzzle

The sliding puzzle game and solver with various algorithms.

The app is hosted at [https://rexcheng1997.github.io/sliding-puzzle](https://rexcheng1997.github.io/sliding-puzzle).

![Sliding puzzle](https://rexcheng1997.github.io/public/images/sliding-puzzle.png)

## Supported Puzzle Type

- N puzzle: An `m x n` puzzle with m rows and n columns. If you can move the tiles so that the numbers on them are arranged sequentially in rows with the bottom right corner as an empty tile, you have then successfully solved the puzzle.

    Taking a `3 x 3` puzzle as example, your goal is to arrange the tiles to reach the following state:  
    |   1   |   2   |   3   |
    | :---- | :---- | :---- |
    | **4** | **5** | **6** |
    | **7** | **8** |       |

## Algorithms

- [Static Weighting A*](https://en.wikipedia.org/wiki/A*_search_algorithm#cite_ref-15)  
    ![f(n)=g(n)&plus;\varepsilon&space;h(n),\quad&space;\varepsilon&space;>&space;1](https://latex.codecogs.com/svg.latex?f%28n%29%3Dg%28n%29&plus;%5Cvarepsilon%20h%28n%29%2C%5Cquad%20%5Cvarepsilon%20%3E%201)

- [Dynamic Weighting A*](https://www.cs.auckland.ac.nz/courses/compsci709s2c/resources/Mike.d/Pohl1973WeightedAStar.pdf)  
    ![f(n)=g(n)&plus;(1&plus;\varepsilon&space;w(n))h(n),\quad&space;\mathrm{where}\&space;w(n)=\left\{\begin{matrix}&space;1&space;-&space;\frac{d(n)}{N}&space;&&space;d(n)\le&space;N&space;\\&space;0&space;&&space;\mathrm{otherwise}&space;\end{matrix}\right.](https://latex.codecogs.com/svg.latex?f%28n%29%3Dg%28n%29&plus;%281&plus;%5Cvarepsilon%20w%28n%29%29h%28n%29%2C%5Cquad%20%5Cmathrm%7Bwhere%7D%5C%20w%28n%29%3D%5Cleft%5C%7B%5Cbegin%7Bmatrix%7D%201%20-%20%5Cfrac%7Bd%28n%29%7D%7BN%7D%20%26%20d%28n%29%5Cle%20N%20%5C%5C%200%20%26%20%5Cmathrm%7Botherwise%7D%20%5Cend%7Bmatrix%7D%5Cright.)

- [AlphA*](https://web.archive.org/web/20160131214618/http://home1.stofanet.dk/breese/astaralpha-submitted.pdf.gz)  
    ![f_\alpha(n)=(1&plus;w_\alpha(n))f(n),\&space;\mathrm{where}\&space;w_\alpha(n)=\left\{\begin{matrix}&space;\lambda&space;&&space;g(\pi(n))\ge&space;g(\widetilde{n})\\&space;\Lambda&space;&&space;\mathrm{otherwise}&space;\end{matrix}\right.\&space;\mathrm{and}\&space;\lambda\le\Lambda](https://latex.codecogs.com/svg.latex?f_%5Calpha%28n%29%3D%281&plus;w_%5Calpha%28n%29%29f%28n%29%2C%5C%20%5Cmathrm%7Bwhere%7D%5C%20w_%5Calpha%28n%29%3D%5Cleft%5C%7B%5Cbegin%7Bmatrix%7D%20%5Clambda%20%26%20g%28%5Cpi%28n%29%29%5Cge%20g%28%5Cwidetilde%7Bn%7D%29%5C%5C%20%5CLambda%20%26%20%5Cmathrm%7Botherwise%7D%20%5Cend%7Bmatrix%7D%5Cright.%5C%20%5Cmathrm%7Band%7D%5C%20%5Clambda%5Cle%5CLambda)

## Tech Stacks Used

- Typescript
- Sass
- React
- Material-UI
- webpack
