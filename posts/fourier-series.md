---
title: Blog template
date: Nov 16, 2025
author: Ferdous Alam
subtitle: Template for blogs
keywords: fourier, series, math, periodic functions, trigonometry
---

Any periodic function $f(x)$ can be written as a sum of sines and cosines as:
$$f(x) = a_0 + \sum_{n=1}^\infty \left[a_n \cos(nx) + b_n \sin(nx)\right]$$

This is the essence of Fourier analysis. Besides that This is the essence of Fourier analysis. Besides that This is the essence of Fourier analysis. Besides that This is the essence of Fourier analysis. Besides that 
 
## Orthogonality and coefficients

The trigonometric basis functions are orthogonal on $[-\pi,\pi]$:

$$\int_{-\pi}^{\pi} \cos(nx)\cos(mx)\,dx = \begin{cases}
\pi, & n=m\ne 0 \\
0, & n\ne m \\
2\pi, & n=m=0
\end{cases}$$

and similarly for $\sin(nx)$ with $\cos(mx)$ cross-terms giving zero. The Fourier coefficients are

$$a_0 = \frac{1}{2\pi}\int_{-\pi}^{\pi} f(x)\,dx,\quad
a_n = \frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\cos(nx)\,dx,\quad
b_n = \frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\sin(nx)\,dx.$$

## Partial sums and Gibbs phenomenon

Let $S_N(x)$ denote the $N$-term partial sum. Near jump discontinuities, $S_N$ overshoots by about $9\%$ regardless of $N$ (the Gibbs phenomenon). In practice you can smooth with Fejér or Lanczos factors.

### Example: square wave sample coefficients

| n | $a_n$ (approx) | $b_n$ (approx) |
|---|----------------:|----------------:|
| 1 | 1.273239 | 0.000000 |
| 2 | 0.000000 | 0.000000 |
| 3 | 0.424413 | 0.000000 |
| 5 | 0.254648 | 0.000000 |
| 7 | 0.181891 | 0.000000 |

> Note: Values are illustrative; exact values depend on the chosen square wave convention and normalization.

### Python: compute coefficients numerically

We can integrate numerically with `np.trapz` for a quick approximation.

```python
import numpy as np

def fourier_coeffs(f, N=10, M=10000):
		x = np.linspace(-np.pi, np.pi, M, endpoint=False)
		y = f(x)
		a0 = (1/(2*np.pi)) * np.trapz(y, x)
		a = np.zeros(N+1)
		b = np.zeros(N+1)
		for n in range(1, N+1):
				a[n] = (1/np.pi) * np.trapz(y*np.cos(n*x), x)
				b[n] = (1/np.pi) * np.trapz(y*np.sin(n*x), x)
		return a0, a, b

# Example: square wave (sign of sine)
f = lambda x: np.sign(np.sin(x))
a0, a, b = fourier_coeffs(f, N=9)
print("a0=", round(a0, 6))
print("a[1:10]=", np.round(a[1:10], 6))
print("b[1:10]=", np.round(b[1:10], 6))
```

### JavaScript: evaluate a partial sum

```javascript
function partialSum(a0, a, b, x, N) {
	let s = a0;
	for (let n = 1; n <= N; n++) {
		s += (a[n] || 0) * Math.cos(n * x) + (b[n] || 0) * Math.sin(n * x);
	}
	return s;
}

// demo coefficients for a square-like wave (odd harmonics only)
const N = 9;
const a0 = 0;
const a = Array(N+1).fill(0);
const b = Array(N+1).fill(0);
for (let n = 1; n <= N; n += 2) {
	a[n] = 4 / (Math.PI * n);
}

console.log(partialSum(a0, a, b, Math.PI/4, N));
```

### Takeaways

- The basis is orthogonal, enabling simple coefficient formulas.
- Partial sums converge pointwise except at jumps; overshoot persists.
- Numerical integration provides good approximations quickly.
- Tables of coefficients help compare decay rates and convergence.
 - Tables of coefficients help compare decay rates and convergence.

### Pseudocode: coefficient computation

```pseudocode
Algorithm FourierSeries(f, N)
	Input: function f, integer N
	Output: a0, arrays a[1..N], b[1..N]
	a0 <- (1/(2π)) ∫_{-π}^{π} f(x) dx
	for n <- 1 to N do
		a[n] <- (1/π) ∫_{-π}^{π} f(x) cos(nx) dx
		b[n] <- (1/π) ∫_{-π}^{π} f(x) sin(nx) dx
	end for
	return (a0, a, b)
end Algorithm
```
