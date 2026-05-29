import math
import os
import pickle
import time
from contextlib import nullcontext, contextmanager
from pathlib import Path
from typing import Optional

import numpy as np
import torch
from torch.distributed import init_process_group, destroy_process_group
from torch.nn.parallel import DistributedDataParallel as DDP

from llm.loader import load_data, ModelLoader
from llm.model import GPTConfig, GPT
from llm.utils import MISSING, make_dir
from llm.ml import ML

DIR = Path(__file__).parent

_DEFAULT_CONFIG = dict(
    training_data_path=None,
    init_from='scratch',
    torch_compile=True,
    train_ratio=0.9,
    log_interval=10,
    eval_interval=100,
    eval_iters=20,
    eval_only=False,
    always_save_checkpoint=False,
    override_checkpoint=True,
    wandb_log=False,
    wandb_project='owt',
    wandb_run_name='gpt2',
    encoding='gpt2',
    dataset=None,
    gradient_accumulation_steps=5 * 8,
    batch_size=12,
    block_size=1024,
    n_layer=12,
    n_head=12,
    n_embd=768,
    dropout=0.0,
    bias=False,
    learning_rate=6e-4,
    max_iters=600000,
    weight_decay=1e-1,
    beta1=0.9,
    beta2=0.95,
    grad_clip=1.0,
    decay_lr=True,
    warmup_iters=2000,
    lr_decay_iters=600000,
    min_lr=6e-5,
    backend='nccl',
    patience=5,
    profile=False,
    profile_dir='profile_logs',
    synchronize=False,
)


class Trainer(ML):
    """
    This trainer can be run both on a single gpu in debug mode,
    and also in a larger training run with distributed data parallel (ddp).

    To run on a single GPU, example:
    $ python train.py

    To run with DDP on 4 gpus on 1 node, example:
    $ torchrun --standalone --nproc_per_node=4 train.py

    To run with DDP on 4 gpus across 2 nodes, example:
    - Run on the first (master) node with example IP 123.456.123.456:
    $ torchrun --nproc_per_node=8 --nnodes=2 --node_rank=0 --master_addr=123.456.123.456 --master_port=1234 train.py
    - Run on the worker node:
    $ torchrun --nproc_per_node=8 --nnodes=2 --node_rank=1 --master_addr=123.456.123.456 --master_port=1234 train.py
    (If your cluster does not have Infiniband interconnect prepend NCCL_IB_DISABLE=1)
    """

    def __init__(
        self,
        training_data_path: Optional[str] = MISSING,
        init_from: str = MISSING,
        torch_compile: bool = MISSING,
        train_ratio: float = MISSING,
        log_interval: int = MISSING,
        eval_interval: int = MISSING,
        eval_iters: int = MISSING,
        eval_only: bool = MISSING,
        always_save_checkpoint: bool = MISSING,
        override_checkpoint: bool = MISSING,
        wandb_log: bool = MISSING,
        wandb_project: str = MISSING,
        wandb_run_name: str = MISSING,
        encoding: str = MISSING,
        dataset: Optional[str] = MISSING,
        gradient_accumulation_steps: int = MISSING,
        batch_size: int = MISSING,
        block_size: int = MISSING,
        n_layer: int = MISSING,
        n_head: int = MISSING,
        n_embd: int = MISSING,
        dropout: float = MISSING,
        bias: bool = MISSING,
        learning_rate: float = MISSING,
        max_iters: int = MISSING,
        weight_decay: float = MISSING,
        beta1: float = MISSING,
        beta2: float = MISSING,
        grad_clip: float = MISSING,
        decay_lr: bool = MISSING,
        warmup_iters: int = MISSING,
        lr_decay_iters: int = MISSING,
        min_lr: float = MISSING,
        backend: str = MISSING,
        patience: int = MISSING,
        profile: bool = MISSING,
        profile_dir: str = MISSING,
        synchronize: bool = MISSING,
        **kwargs
    ):
        """
        :param training_data_path: path to data or key in data_paths.json
        :param dataset: dataset name  (used only for the directory name where to store the data)
        :param model_path: output directory, ignored if init_from is not 'resume'
        :param init_from: either 'resume' (from an model_path), 'scratch', or a gpt2 variant (e.g. 'gpt2-xl')
        :param torch_compile: use PyTorch 2.0 to compile the model to be faster
        :param device: 'cpu', 'cuda', 'cuda:0', 'cuda:1' etc., or try 'mps' on macbooks
        :param dtype: 'float16', 'bfloat16', 'float32', 'float64' etc.
        :param train_ratio: what fraction of the data to use for training
        :param eval_interval: how often to evaluate the model
        :param log_interval: how often to log loss info
        :param eval_iters: how many iters to evaluate
        :param eval_only: if True, run eval only
        :param always_save_checkpoint: if True, save checkpoints after each eval
        :param override_checkpoint: if True, override the previous checkpoint
        :param wandb_log: if True, log with wandb
        :param wandb_project: wandb project name
        :param wandb_run_name: wandb run name
        :param gradient_accumulation_steps: gradient accumulation steps, used to simulate larger batch sizes
        :param batch_size: batch size. if gradient_accumulation_steps > 1, this is the micro-batch size
        :param block_size: block size
        :param n_layer: number of layers
        :param n_head: number of heads
        :param n_embd: embedding dimension
        :param dropout: dropout. for pretraining 0 is good, for fine-tuning try 0.1+
        :param bias: bias
        :param learning_rate: learning rate
        :param max_iters: maximum number of iterations
        :param weight_decay: weight decay
        :param beta1: beta1 for adam
        :param beta2: beta2 for adam
        :param grad_clip: gradient clipping. disable if == 0.0
        :param decay_lr: whether to decay learning rate
        :param warmup_iters: warmup iterations
        :param lr_decay_iters: learning rate decay iterations. should be ~= max_iters per Chinchilla
        :param min_lr: minimum learning rate. should be ~= learning_rate/10 per Chinchilla
        :param backend: DDP backend. 'nccl', 'gloo', etc.
        :param patience: how many unimproved evals to wait before early stopping
        :param profile: if True, use torch profiler
        :param profile_dir: directory to store the profiles
        :param synchronize: host-device synchronization, for proper benchmarking of compute time per step
        """
        self.__dict__.update(_DEFAULT_CONFIG)
        super().__init__(**kwargs)
        if training_data_path is not MISSING:
            self.training_data_path = training_data_path
        if init_from is not MISSING:
            self.init_from = init_from
        if torch_compile is not MISSING:
            self.torch_compile = torch_compile
        if log_interval is not MISSING:
            self.log_interval = log_interval
        if eval_interval is not MISSING:
            self.eval_interval = eval_interval
        if eval_iters is not MISSING:
            self.eval_iters = eval_iters
        if eval_only is not MISSING:
            self.eval_only = eval_only
        if always_save_checkpoint is not MISSING:
            self.always_save_checkpoint = always_save_checkpoint
        if override_checkpoint is not MISSING:
            self.override_checkpoint = override_checkpoint
        if wandb_log is not MISSING:
            self.wandb_log = wandb_log
        if wandb_project is not MISSING:
            self.wandb_project = wandb_project
        if wandb_run_name is not MISSING:
            self.wandb_run_name = wandb_run_name
        if gradient_accumulation_steps is not MISSING:
            self.gradient_accumulation_steps = gradient_accumulation_steps
        if batch_size is not MISSING:
            self.batch_size = batch_size
        if block_size is not MISSING:
            self.block_size = block_size
        if n_layer is not MISSING:
            self.n_layer = n_layer
        if n_head is not MISSING:
            self.n_head = n_head
        if n_embd is not MISSING:
            self.n_embd = n_embd
        if dropout is not MISSING:
            self.dropout = dropout
        if bias is not MISSING:
            self.bias = bias
        if learning_rate is not MISSING:
            self.learning_rate = learning_rate
        if max_iters is not MISSING:
            self.max_iters = max_iters
        if weight_decay is not MISSING:
            self.weight_decay = weight_decay
        if beta1 is not MISSING:
            self.beta1 = beta1
        if beta2 is not MISSING:
            self.beta2 = beta2
        if grad_clip is not MISSING:
            self.grad_clip = grad_clip
        if decay_lr is not MISSING:
            self.decay_lr = decay_lr
        if warmup_iters is not MISSING:
            self.warmup_iters = warmup_iters
        if lr_decay_iters is not MISSING:
            self.lr_decay_iters = lr_decay_iters
        if min_lr is not MISSING:
            self.min_lr = min_lr
        if backend is not MISSING:
            self.backend = backend
        if patience is not MISSING:
            self.patience = patience
        if profile is not MISSING:
            self.profile = profile
        if profile_dir is not MISSING:
            self.profile_dir = profile_dir
        if synchronize is not MISSING:
            self.synchronize = synchronize
        if train_ratio is not MISSING:
            self.train_ratio = train_ratio
        if encoding is not MISSING:
            self.encoding = encoding
        if dataset is not MISSING:
            self.dataset = dataset

        # if not ddp, we are running on a single gpu, and one process
        self.master_process = True
        self.seed_offset = 0
        self.model = None
        self.data_dir = None
        self.start_iter_num = 0
        self.best_val_loss = 1e9

        # is this a distributed data parallel run (multiple GPU nodes)?
        self.ddp = int(os.environ.get('RANK', -1)) != -1
        self.ddp_world_size = 1
        self.ddp_local_rank = None

        self.model_args = dict(
            n_layer=self.n_layer,
            n_head=self.n_head,
            n_embd=self.n_embd,
            block_size=self.block_size,
            bias=self.bias,
            vocab_size=0,
            dropout=self.dropout,
        )  # start with model_args from command line

        make_dir(self.model_path)

    def resume(self):
        self.init_from = 'resume'

    def _setup_ddp(self):
        if self.ddp:
            init_process_group(backend=self.backend)
            ddp_rank = int(os.environ['RANK'])
            self.ddp_local_rank = int(os.environ['LOCAL_RANK'])  # ID (within the local node / server) of the GPU to use
            ddp_world_size = int(os.environ['WORLD_SIZE'])  # number of processes / GPUs in DDP
            self.device = f'cuda:{self.ddp_local_rank}'
            torch.cuda.set_device(self.device)
            self.master_process = ddp_rank == 0  # this process will do logging, checkpointing etc.
            self.seed_offset = ddp_rank  # each process gets a different seed
            # world_size number of processes will be training simultaneously, so we can scale
            # down the desired gradient accumulation iterations per process proportionally
            assert self.gradient_accumulation_steps % ddp_world_size == 0
            self.gradient_accumulation_steps //= ddp_world_size
        tokens_per_iter = self.gradient_accumulation_steps * self.ddp_world_size * self.batch_size * self.block_size
        print(f"tokens per iteration will be: {tokens_per_iter:,}")

    def _get_batch(self, split: str):
        """
        Generate a small batch of data of inputs x and targets y
    
        :param split: train or val
        :return: (x, y)
        """
        # We recreate np.memmap every batch to avoid a memory leak, as per
        # https://stackoverflow.com/questions/45132940/numpy-memmap-memory-usage-want-to-iterate-once/61472122#61472122
        # data = np.memmap(cache[f"input_ids_{dataset}_{split}"], dtype=np.uint16, mode='r')
        data = np.memmap(self.data_dir / f'{split}.bin', dtype=np.uint16, mode='r')

        ix = torch.randint(len(data) - self.block_size, (self.batch_size,))

        x = torch.stack([torch.from_numpy((data[i:i + self.block_size]).astype(np.int64)) for i in ix])
        y = torch.stack([torch.from_numpy((data[i + 1:i + 1 + self.block_size]).astype(np.int64)) for i in ix])

        if self.is_cuda:
            # pin arrays x,y, which allows us to move them to GPU asynchronously (non_blocking=True)
            _f = lambda _: _.pin_memory().to(self.device, non_blocking=True)
        else:
            _f = lambda _: _.to(self.device)

        x, y = map(_f, [x, y])

        return x, y

    @torch.no_grad()
    def estimate_loss(self):
        """
        Helps estimate an arbitrarily accurate loss over either split using many batches
        """
        results = {}
        self.model.eval()
        for split in ['train', 'val']:
            losses = torch.zeros(self.eval_iters)
            for k in range(self.eval_iters):
                X, Y = self._get_batch(split)
                with self.ctx:
                    logits, loss = self.model(X, Y)
                losses[k] = loss.item()
            results[split] = losses.mean()
        self.model.train()
        return results

    def _get_lr(self, it):
        """
        Learning rate decay scheduler (cosine with warmup)
        """
        if not self.decay_lr:
            return self.learning_rate

        # 1) linear warmup for warmup_iters steps
        if it < self.warmup_iters:
            return self.learning_rate * it / self.warmup_iters

        # 2) if it > lr_decay_iters, return min learning rate
        if it > self.lr_decay_iters:
            return self.min_lr

        # 3) in between, use cosine decay down to min learning rate
        decay_ratio = (it - self.warmup_iters) / (self.lr_decay_iters - self.warmup_iters)
        assert 0 <= decay_ratio <= 1
        coeff = 0.5 * (1.0 + math.cos(math.pi * decay_ratio))  # coeff ranges 0..1
        return self.min_lr + coeff * (self.learning_rate - self.min_lr)

    @contextmanager
    def _ddp_ctx(self):
        """
        Wrap model into DDP container
        """
        if self.ddp:
            try:
                self.model = DDP(self.model, device_ids=[self.ddp_local_rank])
                yield
            finally:
                destroy_process_group()
        else:
            yield

    def run(self):
        self._setup_ddp()

        if self.master_process:
            os.makedirs(self.model_path, exist_ok=True)

        self.manual_seed()

        self.data_dir = load_data(
            name=self.dataset,
            train_ratio=self.train_ratio,
            data_path=self.training_data_path,
            encoding=self.encoding,
        )

        # When to save the init model (cannot save it just after initialization)
        iter_save_init_ckpt = 1 if self.init_from.startswith('gpt2') else min(self.eval_interval, 10)

        optimizer, scaler = self.load_model()

        with self._ddp_ctx(), self._profile_ctx() as prof:

            # logging
            if self.wandb_log and self.master_process:
                import wandb
                wandb.init(project=self.wandb_project, name=self.wandb_run_name, config=self.get_config())

            # training loop
            X, Y = self._get_batch('train')  # fetch the very first batch
            t0 = time.time()
            local_iter_num = 0  # number of iterations in the lifetime of this process
            raw_model = self.model.module if self.ddp else self.model  # unwrap DDP container if needed
            running_mfu = None
            val_loss_not_improved_count = 0
            self._synchronize()
            for iter_num in range(self.start_iter_num, self.max_iters):
                lr = self._get_lr(iter_num)
                for param_group in optimizer.param_groups:
                    param_group['lr'] = lr

                # evaluate the loss on train/val sets and write results
                if (iter_num % self.eval_interval == 0 or iter_num == iter_save_init_ckpt) and self.master_process:
                    losses = self.estimate_loss()
                    print(f"step {iter_num}: train loss {losses['train']:.4f}, val loss {losses['val']:.4f}")
                    if self.wandb_log:
                        import wandb
                        wandb.log({
                            "iter": iter_num,
                            "train/loss": losses['train'],
                            "val/loss": losses['val'],
                            "lr": lr,
                            "mfu": running_mfu * 100 if running_mfu is not None else None,  # convert to percentage
                        })
                    val_loss_improved = losses['val'] < self.best_val_loss
                    if val_loss_improved:
                        val_loss_not_improved_count = 0
                    else:
                        val_loss_not_improved_count += 1
                    if (val_loss_improved or self.always_save_checkpoint) and iter_num > 0:
                        self.best_val_loss = losses['val']
                        checkpoint = {
                            'model': raw_model.state_dict(),
                            'optimizer': optimizer.state_dict(),
                            'model_args': self.model_args,
                            'iter_num': iter_num,
                            'best_val_loss': self.best_val_loss,
                            'config': self.get_config(),
                        }
                        if iter_num == iter_save_init_ckpt:
                            filename = 'ckpt_init.pt'
                        elif self.override_checkpoint:
                            filename = f'ckpt.pt'
                        else:
                            filename = f'ckpt_{iter_num:06}.pt'
                        file_path = self.model_path / filename
                        print(f"saving checkpoint to {file_path}")
                        torch.save(checkpoint, file_path)

                if val_loss_not_improved_count > self.patience:
                    print(f"Validation loss did not improve for {self.patience} iterations, stopping now "
                          f"as it is unlikely to get better.")
                    break

                if iter_num == 0 and self.eval_only:
                    break

                # forward backward update, with optional gradient accumulation to simulate larger batch size
                # and using the GradScaler if data type is float16
                for micro_step in range(self.gradient_accumulation_steps):
                    if self.ddp:
                        # in DDP training we only need to sync gradients at the last micro step.
                        # the official way to do this is with model.no_sync() context manager, but
                        # I really dislike that this bloats the code and forces us to repeat code
                        # looking at the source of that context manager, it just toggles this variable
                        self.model.require_backward_grad_sync = (micro_step == self.gradient_accumulation_steps - 1)
                    with self.ctx:
                        logits, loss = self.model(X, Y)
                        loss /= self.gradient_accumulation_steps  # scale the loss to account for gradient accumulation
                    # immediately async prefetch next batch while model is doing the forward pass on the GPU
                    X, Y = self._get_batch('train')
                    # backward pass, with gradient scaling if training in fp16
                    scaler.scale(loss).backward()
                # clip the gradient
                if self.grad_clip != 0.0:
                    scaler.unscale_(optimizer)
                    torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.grad_clip)
                # step the optimizer and scaler if training in fp16
                scaler.step(optimizer)
                scaler.update()
                # flush the gradients as soon as we can, no need for this memory anymore
                optimizer.zero_grad(set_to_none=True)

                # timing and logging
                t1 = time.time()
                dt = t1 - t0
                t0 = t1
                if iter_num % self.log_interval == 0 and self.master_process and iter_num % self.eval_interval != 0:
                    # get loss as float. note: this is a CPU-GPU sync point
                    # scale up to undo the division above, approximating the true total loss (exact would have been a sum)
                    lossf = loss.item() * self.gradient_accumulation_steps
                    message = f"iter {iter_num}: loss {lossf:.4f}, time {dt * 1000:.2f}ms"
                    if local_iter_num >= 5 and self.is_cuda:  # let the training loop settle a bit
                        mfu = raw_model.estimate_mfu(self.batch_size * self.gradient_accumulation_steps, dt)
                        if mfu is not None:
                            running_mfu = mfu if running_mfu is None else 0.9 * running_mfu + 0.1 * mfu
                            message += f", mfu {running_mfu * 100:.2f}%"
                    print(message)

                local_iter_num += 1
                if prof is not None:
                    prof.step()

            self._synchronize()

        print(f"Training done, best_val_loss = {self.best_val_loss}")

    def load_model(self):
        checkpoint = None
        if self.init_from == 'scratch':
            print("Initializing a new model from scratch")

            # determine the vocab size we'll use for from-scratch training
            meta_vocab_size = self.get_vocab_size()
            if meta_vocab_size is not None:
                self.model_args['vocab_size'] = meta_vocab_size
            else:
                print("defaulting to vocab_size of GPT-2 to 50304 (50257 rounded up for efficiency)")
                self.model_args['vocab_size'] = 50304

            gpt_conf = GPTConfig(**self.model_args)
            self.model = GPT(gpt_conf)
        elif self.init_from == 'resume':
            print(f"Resuming training from {self.model_path}")
            # resume training from a checkpoint.
            model_loader = ModelLoader(
                model_path=self.model_path,
                device=self.device,
                dropout=self.dropout,
            )
            self.model = model_loader.load()
            checkpoint = model_loader.checkpoint

            # force these config attributes to be equal otherwise we can't even resume training
            # the rest of the attributes (e.g. dropout) can stay as desired from command line
            self.model_args = model_loader.checkpoint['model_args']

            self.start_iter_num = model_loader.checkpoint['iter_num']
            self.best_val_loss = model_loader.checkpoint['best_val_loss']
        elif self.init_from.startswith('gpt2'):
            print(f"Initializing from OpenAI GPT-2 weights: {self.init_from}")
            # initialize from OpenAI GPT-2 weights
            override_args = dict(dropout=self.dropout)
            self.model = GPT.from_pretrained(self.init_from, override_args)
            # read off the created config params, so we can store them into checkpoint correctly
            for k in self.model_args.keys():
                if k not in override_args:
                    self.model_args[k] = getattr(self.model.config, k)
        else:
            raise ValueError(f"unknown init_from option: {self.init_from}")
        # crop down the model block size if desired, using model surgery
        if self.block_size < self.model.config.block_size:
            self.model.crop_block_size(self.block_size)
            self.model_args['block_size'] = self.block_size  # so that the checkpoint will have the right value
        self.model.to(self.device)
        # initialize a GradScaler. If enabled=False scaler is a no-op
        scaler = torch.amp.GradScaler(device=self.device, enabled=self.dtype == 'float16')
        # optimizer
        optimizer = self.model.configure_optimizers(
            weight_decay=self.weight_decay,
            learning_rate=self.learning_rate,
            betas=(self.beta1, self.beta2),
            device_type=self.device_type,
        )
        if self.init_from == 'resume':
            optimizer.load_state_dict(checkpoint['optimizer'])
        del checkpoint
        self.compile_model()
        return optimizer, scaler

    def get_vocab_size(self):
        """
        Attempt to derive vocab_size from the dataset
        """
        meta_path = self.data_dir / 'meta.pkl'
        if os.path.exists(meta_path):
            with open(meta_path, 'rb') as f:
                meta = pickle.load(f)
            stoi, itos = meta.get('stoi'), meta.get('itos')
            if stoi is not None and itos is not None:
                assert len(stoi) == len(itos), f"{len(stoi)} != {len(itos)}"
                meta_vocab_size = len(stoi)
                print(f"found vocab_size = {meta_vocab_size}")
                return meta_vocab_size

    def _profile_ctx(self):
        """
        Useful docs on pytorch profiler:
        - tutorial https://pytorch.org/tutorials/intermediate/tensorboard_profiler_tutorial.html
        - api https://pytorch.org/docs/stable/profiler.html#torch.profiler.profile
        """
        if not self.profile:
            return nullcontext()
        skip_first, wait, warmup, active = 0, 1, 1, self.max_iters
        activities = [torch.profiler.ProfilerActivity.CPU]
        if self.is_cuda:
            activities.append(torch.profiler.ProfilerActivity.CUDA)
        return torch.profiler.profile(
            activities=activities,
            schedule=torch.profiler.schedule(skip_first=skip_first, wait=wait, warmup=warmup, active=active, repeat=1),
            on_trace_ready=torch.profiler.tensorboard_trace_handler(self.profile_dir),
            record_shapes=True,
            profile_memory=True,
            with_stack=True,  # incurs an additional overhead, disable if not needed
            with_flops=True,
            with_modules=False,
        )

    def _synchronize(self):
        if self.synchronize:
            torch.cuda.synchronize(device=self.device)


if __name__ == '__main__':
    Trainer(config_file='train.json').run()
