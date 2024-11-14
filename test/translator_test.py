from unittest.mock import Mock, patch
import unittest

class TestTranslator(unittest.TestCase):
    def test_llm_normal_response(self):
        """Test normal LLM response"""
        with patch('openai.AzureOpenAI') as mock_client:
            # Mock the client responses
            mock_responses = [
                Mock(choices=[Mock(message=Mock(content="No"))]),  # Language detection
                Mock(choices=[Mock(message=Mock(content="Hello world"))]),  # Translation
            ]
            mock_client.return_value.chat.completions.create.side_effect = mock_responses
            
            # Test translation
            is_english, translation = translate("Hallo Welt")
            
            self.assertEqual(is_english, False)
            self.assertEqual(translation, "Hello world")

    def test_llm_gibberish_response(self):
        """Test handling of gibberish input"""
        with patch('openai.AzureOpenAI') as mock_client:
            # Mock an unexpected response
            mock_client.return_value.chat.completions.create.return_value = Mock(
                choices=[Mock(message=Mock(content="I don't understand"))]
            )
            
            # Test translation of gibberish
            is_english, translation = translate("asdfghjkl")
            
            self.assertEqual(is_english, False)
            self.assertEqual(translation, "Error: Could not determine language")

if __name__ == '__main__':
    unittest.main()