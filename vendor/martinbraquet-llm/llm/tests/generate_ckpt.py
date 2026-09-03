import torch

from llm.train import Trainer
from llm.loader import ModelLoader


def main():
    config_file = 'train_test.json'
    trainer = Trainer(config_file=config_file)
    trainer.run()
    # model_path = 'test'
    # model_loader = ModelLoader(model_path=model_path)
    # model_loader.load()
    # config = model_loader.checkpoint['config']
    # config['model_path'] = model_path
    # config['config_file'] = 'train_test.json'
    # config['training_data_path'] = 'test/prince.txt'
    # torch.save(model_loader.checkpoint, model_loader.ckpt_path)


if __name__ == '__main__':
    main()
