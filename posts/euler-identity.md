---
title: Transformer implementation deconstructed
date: Aug 21, 2022
author: Ferdous Alam
subtitle: A cheat sheet for transformer implementation
keywords: transformer, deep learning, attention, neural networks, implementation
---

 **NOTE:** Code implementation can be found at this [repo](https://github.com/ferdous-alam/DeconstructedML/tree/master/Deconstructed_Deep_learning/Transformers).


Few symbols:

| symbol | tensor shape | description |
| -----  | ----- | ------- |
| $B$ | - | batch size | 
| $l_z$ | - | context/source sequence length | 
| $l_x$ | - | primary/target sequence length | 
| $d_\text{model}$ | - | input dimension |
| $d_k$ | - | dimension of query/key embedding | 
| $d_v$ | - | dimension of value embedding | 
| $B$ | - | batch size | 
| $h$ | - | number of heads | 
| $LN$ | - | layer norm | 
| $FFN$ | - | feed forward network | 
| $\mathbf{Z}$ | $(B, l_z, d_\text{model})$ | context/source sequence | 
| $\mathbf{X}$ | $(B, l_x, d_\text{model})$ | primary/target sequence | 
| $\mathbf{M}_{\mathbf{zz}}$ | $(B, l_z, l_z)$ | source mask | 
| $\mathbf{M}_{\mathbf{xx}}$ | $(B, l_x, l_x)$ | target mask |
| $\mathbf{M}_{\mathbf{xz}}$ | $(l_z, l_z)$ | memory mask |
| $L_{enc}$ | - | number of encoder layers |
| $L_{dec}$ | - | number of decoder layers |
  
  
We start with the originally proposed encoder-decoder (ED) transformer <sup>[[6](#ref6)]</sup>. If we only use the encoder of the transformer, then it is similar to the BERT <sup>[[2](#ref2)]</sup> model and if we only use the decoder of the transformer then it is similar to the GPT model <sup>[[5](#ref5)]</sup>. For clarity, we consider a batched source sequence data $\mathbf{Z}$ which consists of $B$ sequences. Each sequence is of length $l_z$. This means that the sequence consists of $l_z$ number of tokens or vector representation of some input.

$$ \mathbf{Z} = \begin{bmatrix} \mathbf{z}^1_1 & \mathbf{z}^1_2 & \dots & \mathbf{z}^1_{l_z} \\ 
                \mathbf{z}^2_1 & \mathbf{z}^2_2 & \dots & \mathbf{z}^2_{l_z} \\ 
                \vdots & \vdots & \vdots & \vdots \\
                \mathbf{z}^{B}_1 & \mathbf{z}^{B}_2 & \dots & \mathbf{z}^{B}_{l_z}
                \end{bmatrix}$$
                
where, $$\mathbf{z}_i \in \mathbb{R}^{1\times d_\text{model}}, \ \ \ \ i = 1, 2, \dots, l_z$$
                
Similarly, we consider a batched target sequence data $\mathbf{X}$ that contain $B$ sequences in total. Each target sequence is of length $l_x$.

$$ \mathbf{X} = \begin{bmatrix} \mathbf{x}^1_1 & \mathbf{x}^1_2 & \dots & \mathbf{x}^1_{l_x} \\ 
                \mathbf{x}^2_1 & \mathbf{x}^2_2 & \dots & \mathbf{x}^2_{l_x} \\ 
                \vdots & \vdots & \vdots & \vdots \\
                \mathbf{x}^{B}_1 & \mathbf{x}^{B}_2 & \dots & \mathbf{x}^{B}_{l_x}
                \end{bmatrix}$$

where, $$\mathbf{x}_i \in \mathbb{R}^{1\times d_\text{model}}, \ \ \ \ i = 1, 2, \dots, l_x$$

The goal is to learn a representation of the target sequence, $\mathbf{X}$, that utilizes multi-head attention to capture important correlation within the sequence. Finally, people use these representations for various downstream tasks i.e. machine translation <sup>[[6](#ref6)]</sup>, next word prediction <sup>[[7](#ref7)]</sup>, computer vision <sup>[[3](#ref3)]</sup>, reinforcement learning <sup>[[1](#ref1)]</sup> etc. A wonderful paper from DeepMind describes the formal algorithms for transformers <sup>[[4](#ref4)]</sup> very neatly. 

### Mask
Mask allows the transformer to decide which part of the output should the model see at each timestep. 

$$\mathbf{M}_{\mathbf{x}\mathbf{z}} = \begin{bmatrix} \text{Mask}[\mathbf{x}_0, \mathbf{z}_0] & \text{Mask}[\mathbf{x}_0, \mathbf{z}_1]&  \text{Mask}[\mathbf{x}_0, \mathbf{z}_2] & \dots &\text{Mask}[\mathbf{x}_0, \mathbf{z}_{l_z}]  \\ 
\text{Mask}[\mathbf{x}_1, \mathbf{z}_0] & \text{Mask}[\mathbf{x}_1, \mathbf{z}_1]&  \text{Mask}[\mathbf{x}_1, \mathbf{z}_2] & \dots & \text{Mask}[\mathbf{x}_1, \mathbf{z}_{l_z}] \\
\vdots & \vdots&  \vdots & \dots & \vdots \\ 
\text{Mask}[\mathbf{x}_{l_x}, \mathbf{z}_0] & \text{Mask}[\mathbf{x}_{l_x}, \mathbf{z}_1]&  \text{Mask}[\mathbf{x}_{l_x}, \mathbf{z}_2] & \dots  & \text{Mask}[\mathbf{x}_{l_x}, \mathbf{z}_{l_z}]
\end{bmatrix} \in \mathbb{R}^{l_x \times l_z}$$

For example, if we want the model to see the whole sequence to calculate attention while training,then we do not need to do any masking. This model deploys **bidirectional** attention. The whole sequence should be available at the same time. For a single $i$-th sequence, the mask would look like this
$$\mathbf{M}_{\mathbf{x}\mathbf{z}} = \begin{bmatrix} 1& 1&  1 & \dots & 1  \\ 
1& 1&  1 & \dots & 1  \\ 
\vdots & \vdots&  \vdots & \dots & \vdots \\ 
1& 1&  1 & \dots & 1
\end{bmatrix} \in \mathbb{R}^{l_x \times l_z}$$

Similarly, for auto-regressive models, we want the model to calculate attention based on unseen outputs until that timestep. Hence, the mask would be 
$$\mathbf{M}_{\mathbf{x}\mathbf{z}} = \begin{bmatrix} 1& 0&  0 & \dots & 0  \\ 
1& 1&  0 & \dots & 0  \\ 
\vdots & \vdots&  \vdots & \dots & \vdots \\ 
1& 1&  1 & \dots & 1
\end{bmatrix} \in \mathbb{R}^{l_x \times l_z}$$


In summary, if the length of each sequence at timestep $t$ is $t_x$ and $t_z$ respectively, then we can express each mask as the following, 

$$\text{Mask}[t_x, t_z] = \begin{cases} 1 \quad \quad \quad \quad  \text{for bidirectional attention} \\ [[t_x \geq t_z]]  \quad \text{for unidirectional attention} \end{cases}$$

For conveniece, we introduce two additional terms: 

  1) self-masks, $\mathbf{M}\_{\mathbf{x}\mathbf{x}}$ or $\mathbf{M}\_{\mathbf{z}\mathbf{z}}$: When we want to mask the same sequence against itself, for example we would use this sort of masking in the encoder part

  2) cross-masks, $\mathbf{M}\_{\mathbf{x}\mathbf{z}}$: When we want to mask a target sequence against a source sequence, for example we would use this sort of masking in the decoder part


## Formal algorithm 
First we provide a pseudoode of the encoder-decoder transformer algorithm. The following pseudocode is a simplified version of the formal algorithm presented in this paper <sup>[[4](#ref4)]</sup>. Initially I wanted to include the original pseudocode from the paper. But it seems like handling a lot of notations while thinking of the implementation. So, I added some trivial abstraction on top of that so the implementation becomes more convenient. Also, each matrix in that paper is transposed which makes the batched implementation little bit difficult to understand. So, I made some required modifications. This may reduce the technical correctness of the pseudocode, but I think that can be thought of as a simplification for implementation purpose. 

### Encoder-decoder transformer
```text
Algorithm 1: Encoder Decoder Transformer
Input: Z ∈ ℝ^{l_z × d_model}, X ∈ ℝ^{l_x × d_model}, vector representations of context and primary sequence
       L_enc, L_dec, number of encoder and decoder layers
       EncoderLayer class, DecoderLayer class
       source_mask, target_mask, memory_mask
Output: X ∈ ℝ^{l_x × d_model}, representation of primary sequence with multi-head attention 
        which can be used for downstream applications

1  For i = 1, 2, ..., L_enc
2      Z ← EncoderLayer(Z, M_zz: Optional)
3  memory = Z
4  For j = 1, 2, ..., L_dec
5      X ← DecoderLayer(X, memory, M_xx: Optional, M_zz: Optional, M_xz: Optional)
```

> **_Implementation note:_**  For efficiency, deepcopy of a single encoder and decoder layer can be performed $L_{enc}$ and $L_{dec}$ times

The training procedure is fairly simple and basically same as other neural network models. To make a broaded sense, I am not including any NLP specific output from the model. So, the output from the model is what we are interested in. We will also need to supply the target so that loss can be caluculated using the output and the target values. Finally we perform gradient descent to minimize the loss. 

### Training procedure 
```text
Algorithm 2: Training Transformer
Input: class EDTransformer, class loss_func, learning rate η

1  for i = 1, 2, ..., N_epochs
2      for (Z, X, target) in train_dataloader          # typical data loader for training data
3          output ← EDTransformer(Z, X, M_xx: Optional, M_zz: Optional, M_xz: Optional)
4          L(θ) = loss_func(output, target)
5          θ ← θ - η · ∇L(θ)
6  return θ
```


## Attention 
Transformers use multi-head attention to learn the contextual information of a sequence.

### Multihead attention
The original $Q, K, V$ matrices are projected into $h$ smaller matrices of using parameter matrices $W_i^Q, W_i^K, W_i^V$. Then attention is calculated for all these smaller matrices and concatened again to calculate attention for the full size input. 

| argument | tensor shape |
| ------ | -------- |
| query $Q$ | $(B, l_x, d_\text{model})$ |
| key, $K$ | $(B, l_z, d_\text{model})$ |
| value, $V$ | $(B, l_z, d_\text{model})$ |
| $\text{multi_attn}$ | $(B, l_x, d_\text{out})$ |



Let's recall the original definition of multi-head attention: 
$$\text{Multi-head attention, }\mathbf{Y}(Q, K, V) = [\mathbf{S}_1; \dots; \mathbf{S}_h]W^O$$
where $\mathbf{S}_i$ is the $i$-th single head attention score. 

As we are dividing the original $Q, K, V$ matrices into smaller matrices, dimension of $Q, K, V$ must be divisible by the number of heads, $h$. This is one way to do that if we want to divide $Q, K, V$ into the same dimension of smaller matrices.
$$ d_k = d_v = d_\text{model} / h$$ 
Alternatively, we can divide $Q, K, V$ into different dimensions of smaller matrices as long as they match the original dimension.  
 

| Parameters | dimension |
| -----  | ----- |
| query projection FFN, $W^Q$ | $\mathbb{R}^{d_\text{model}\times d_k}$ | 
| key projection  FFN, $W^K$ |$\mathbb{R}^{d_\text{model}\times d_k}$ | 
| value projection  FFN, $W^V$ | $\mathbb{R}^{d_\text{out}\times d_v}$ |
| output projection  FFN, $W^O$ | $\mathbb{R}^{hd_v\times d_\text{out}}$ |
  
So, these parameter weight matrices help to project the original $Q, K, V$ into smaller $h$ number of $q, k, v$ matrices for multi-head purpose.
$$\text{query projection, }W_i^Q: Q \rightarrow \mathbf{q}_i$$
$$\text{key projection, }W_i^K: K \rightarrow \mathbf{k}_i$$
$$\text{value projection, }W_i^V: V \rightarrow \mathbf{v}_i$$
For efficient implementation we calculate the attention score for all heads simultaneously by reshaping the tensors. So, the shape of the smaller tensors end up being the following, 

|tensor| expression | shape | efficient implementation |
| ----- |------------- | ------- | ----- | 
| $\mathbf{q}_i$ | $QW^Q_i$ | $(B, l_x, d_k)$  | $(B, h, l_x, d_k)$ | 
| $\mathbf{k}_i$ | $KW^K_i$ | $(B, l_z, d_k)$  | $(B, h, l_z, d_k)$ |
| $\mathbf{v}_i$ | $VW^V_i$ | $(B, l_z, d_v)$  | $(B, h, l_z, d_v)$ |

Note that, for efficient implementation, we calculate $\mathbf{q}_i, \mathbf{k}_i, \mathbf{v}_i$ for all heads simulatenously. 

### Scaled dot product attention
Now, we can calculate attention score, not attention values, using the originally proposed formula

$$\mathbf{S}_i(Q, K, V) = \text{softmax}\left(\frac{q_ik_i^T}{\sqrt{d_k}}\right)v_i$$
Next we concatenate all the attention score to get the original dimension, 
$$\mathbf{S} \leftarrow [\mathbf{S}^1, \mathbf{S}^2, \dots, \mathbf{S}^h]$$

> **_Implementation note:_**  For efficiency, we can implement the heads simultaneously by reshapin the tensors, no need to concat later either

Finally, the attention values would be the following, 
$$\mathbf{W}^O: \mathbf{S} \rightarrow \mathbf{Y}$$
Shape of the input and output tensors would be the follwoing 

| tensor | shape|
| ----- | ----- |
|  $\mathbf{S}$ | $(B, l_x, h*d_v)$ |
|  $\mathbf{Y}$ | $(B, l_x, d_\text{out})$ |


### Self attention, cross-attention
Depending on how we create $Q, K, V$ we can define two types of attention mechanism. 

1. self-attention: Same input, i.e. $\mathbf{X}$ or $\mathbf{Z}$ is used to represent all three matrices, so 
$$\begin{matrix} \mathbf{Q} = \mathbf{X} \\ \mathbf{K} = \mathbf{X} \\ \mathbf{V} = \mathbf{X} \end{matrix}$$ 
2. cross-attention: input, $\mathbf{X}$ is used to represent the query, but output from another encoder, called $\text{memory}$, is used to represent key and value, so  
$$\begin{matrix} \mathbf{Q} = \mathbf{X} \\ \mathbf{K} = \text{memory} \\ \mathbf{V} = \text{memory} \end{matrix}$$


```text
Algorithm 3: Multihead attention
Input: q ∈ ℝ^{l_x × d_k}, k ∈ ℝ^{l_z × d_k}, v ∈ ℝ^{l_z × d_v}, M_xz ∈ {0, 1}^{l_x × l_z}: Optional

1  S ← q kᵀ
2  S ← softmax(S / d_k)
3  S ← S v
4  Y ← W^O S
```

> **_Implementation note:_**  For masking purpose, we can replace each masked element in $\mathbf{M}_\mathbf{xz}$ by $-\infty$ while making the non-masked elements as $0$s. In this way the softmax at line $2$ makes the masked element $0$ while only keeping the non-masked values



## Encoder
Each encoder layer consists of two elements, 1) self-attention and 2) feedforward network (FFN)

```text
Algorithm 4: Encoder Layer
Input: Z: encoder input
       class MultiheadAttention
       M_zz: self-attention of encoder input

1  for k = 1, 2, ..., h
2      Z ← Z + MultiheadAttention(query=Z, key=Z, value=Z, M_zz))
3      Z ← LN(Z)
```

> **_Implementation note:_**  As we are implementing the heads simultaneously, the loop is not really needed.

## Decoder
Each decoder layer consists of three elements, 1) self-attention, 2) cross-attention and 3) feed forward network

```text
Algorithm 5: Decoder layer
Input: X: decoder input
       memory: encoder output  
       class MultiheadAttention
       M_xx: self-attention of decoder input
       M_xz: cross attention of decoder input and encoder output

2    X = LN(X + MultiheadAttention(query=X, key=X, value=X, M_xx)))
3    X = LN(X + MultiheadAttention(query=X, key=memory, value=memory, M_xz))
4    X = LN(X + FFN(X))
```

## BERT and GPT
### Encoder transformer (BERT)
Now, we can define the BERT model in a very straightforward fashion. 

```text
Algorithm 6: Encoder Transformer
Input: X, vector representations of primary sequence  
       L_enc, number of encoder layers, EncoderLayer class
       M_xx, target mask
Output: X, representation of primary sequence with multi-head attention
        which can be used for downstream applications

1  for i = 1, 2, ..., L_enc
2      X ← EncoderLayer(X, M_xx ≡ 1)
```

Similarly, the GPT model can be presented as the following pseudocode. 

### Decoder transformer (GPT)
```text
Algorithm 7: Decoder Transformer
Input: X, vector representations of primary sequence
       L_dec, number of decoder layers  
       class DecoderLayer
       M_xx, target mask
Output: X, representation of primary sequence with multi-head attention
        which can be used for downstream applications

1  For i = 1, 2, ..., L_dec
2      X ← DecoderLayer(X, M_xx[t, t'] = [[t' ≥ t]])
``` 


### Encoder-decoder transformer
```text
Algorithm 1: Encoder Decoder Transformer
Input: Z ∈ ℝ^{l_z × d_model}, X ∈ ℝ^{l_x × d_model}, L_enc, L_dec, EncoderLayer class, DecoderLayer class, source_mask, target_mask, memory_mask
Output: X ∈ ℝ^{l_x × d_model} (representation of primary sequence with multi-head attention for downstream applications)
1. For i = 1, 2, ..., L_enc:
2.     Z ← EncoderLayer(Z, M_zz: Optional)
3. memory = Z
4. For j = 1, 2, ..., L_dec:
5.     X ← DecoderLayer(X, memory, M_xx: Optional, M_zz: Optional, M_xz: Optional)
```


```text
Algorithm 2: Training Transformer
Input: class EDTransformer, class loss_func, learning rate η
1. for i = 1, 2, ..., N_epochs:
2.     for (Z, X, target) in train_dataloader:
3.         output ← EDTransformer(Z, X, M_xx: Optional, M_zz: Optional, M_xz: Optional)
4.         L(θ) = loss_func(output, target)
5.         θ ← θ - η · ∇L(θ)
6. return θ
```


```text
Algorithm 3: Multihead attention
Input: q ∈ ℝ^{l_x × d_k}, k ∈ ℝ^{l_z × d_k}, v ∈ ℝ^{l_z × d_v}, M_xz ∈ {0, 1}^{l_x × l_z} (Optional)
1. S ← q kᵀ
2. S ← softmax(S / d_k)
3. S ← S v
4. Y ← W^O S
```


```text
Algorithm 4: Encoder Layer
Input: Z (encoder input), MultiheadAttention class, M_zz (self-attention of encoder input)
1. for k = 1, 2, ..., h:
2.     Z ← Z + MultiheadAttention(query=Z, key=Z, value=Z, M_zz)
3.     Z ← LN(Z)
```


```text
Algorithm 5: Decoder Layer
Input: X (decoder input), memory (encoder output), MultiheadAttention class, M_xx (self-attention of decoder input), M_xz (cross attention of decoder input and encoder output)
2. X = LN(X + MultiheadAttention(query=X, key=X, value=X, M_xx))
3. X = LN(X + MultiheadAttention(query=X, key=memory, value=memory, M_xz))
4. X = LN(X + FFN(X))
```


```text
Algorithm 6: Encoder Transformer
Input: X (vector representations of primary sequence), L_enc (number of encoder layers), EncoderLayer class, M_xx (target mask)
Output: X (representation of primary sequence with multi-head attention for downstream applications)
1. for i = 1, 2, ..., L_enc:
2.     X ← EncoderLayer(X, M_xx ≡ 1)
```


Similarly, the GPT model can be presented as the following pseudocode.
```text
Algorithm 7: Decoder Transformer
Input: X (vector representations of primary sequence), L_dec (number of decoder layers), DecoderLayer class, M_xx (target mask)
Output: X (representation of primary sequence with multi-head attention for downstream applications)
1. For i = 1, 2, ..., L_dec:
2.     X ← DecoderLayer(X, M_xx[t, t'] = [[t' ≥ t]])
```

---

<div style="font-size: 0.9em;">
<b>References</b><br>
<ol>
<li id="ref1">Chen, Lili, et al. <a href="https://proceedings.neurips.cc/paper/2021/hash/8163b1c0b3c0a6b5f3e7b6c1b1b1b1b1-Abstract.html" target="_blank">“Decision Transformer: Reinforcement Learning via Sequence Modeling.”</a> Advances in Neural Information Processing Systems 34: 15084–97, 2021.</li>
<li id="ref2">Devlin, Jacob, et al. <a href="https://arxiv.org/abs/1810.04805" target="_blank">“Bert: Pre-Training of Deep Bidirectional Transformers for Language Understanding.”</a> arXiv Preprint arXiv:1810.04805, 2018.</li>
<li id="ref3">Dosovitskiy, Alexey, et al. <a href="https://arxiv.org/abs/2010.11929" target="_blank">“An Image Is Worth 16x16 Words: Transformers for Image Recognition at Scale.”</a> arXiv Preprint arXiv:2010.11929, 2020.</li>
<li id="ref4">Phuong, Mary, and Marcus Hutter. <a href="https://arxiv.org/abs/2207.09238" target="_blank">“Formal Algorithms for Transformers.”</a> arXiv Preprint arXiv:2207.09238, 2022.</li>
<li id="ref5">Radford, Alec, et al. <a href="https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf" target="_blank">“Improving Language Understanding by Generative Pre-Training.”</a> 2018.</li>
<li id="ref6">Vaswani, Ashish, et al. <a href="https://arxiv.org/abs/1706.03762" target="_blank">“Attention Is All You Need.”</a> Advances in Neural Information Processing Systems 30, 2017.</li>
<li id="ref7">Yang, Zhilin, et al. <a href="https://arxiv.org/abs/1906.08237" target="_blank">“Xlnet: Generalized Autoregressive Pretraining for Language Understanding.”</a> Advances in Neural Information Processing Systems 32, 2019.</li>
</ol>
</div>
