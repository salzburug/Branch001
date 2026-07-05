import unittest
from sanmple2 import get_average


class TestGetAverage(unittest.TestCase):
    """get_average関数のテストクラス"""
    
    def test_get_average_with_numbers(self):
        """通常の数値リストのテスト"""
        result = get_average([1, 2, 3, 4, 5])
        self.assertEqual(result, 3.0)
    
    def test_get_average_with_empty_list(self):
        """空リストのテスト"""
        result = get_average([])
        self.assertEqual(result, 0)
    
    def test_get_average_with_single_number(self):
        """1つの数値のテスト"""
        result = get_average([10])
        self.assertEqual(result, 10)
    
    def test_get_average_with_negative_numbers(self):
        """負の数を含むテスト"""
        result = get_average([-1, -2, -3])
        self.assertEqual(result, -2.0)
    
    def test_get_average_with_floats(self):
        """小数を含むテスト"""
        result = get_average([1.5, 2.5, 3.5])
        self.assertEqual(result, 2.5)


if __name__ == '__main__':
    unittest.main()
