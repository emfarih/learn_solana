import 'dart:convert';

import 'package:flutter/material.dart';

void showSnackBar(String message, BuildContext context) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message)),
  );
}

List<String> parseAndDecodeMetadata(List<int> data) {
  List<String> decodedChunks = [];
  List<int> currentChunk = [];

  // Iterate through the byte array
  for (int byte in data) {
    // Print each byte for debugging
    print('Processing byte: $byte');

    // If byte is zero, treat it as a separator
    if (byte == 0) {
      if (currentChunk.isNotEmpty) {
        // Decode and add to the list
        try {
          String decodedString = utf8.decode(currentChunk);

          // Only add to list if decoded string is not empty
          if (decodedString.isNotEmpty) {
            decodedChunks.add(decodedString);
            // Print the decoded chunk for debugging
            print('Decoded chunk: $decodedString');
          } else {
            // Print if the decoded chunk is empty and not added
            print('Ignored empty decoded chunk');
          }
        } catch (e) {
          // Handle invalid UTF-8 sequences without throwing
          print('Error decoding chunk, skipping: $e');
        }

        currentChunk.clear(); // Reset the current chunk
      }
    } else {
      currentChunk.add(byte); // Add byte to the current chunk
    }
  }

  // Handle the last chunk if any data exists
  if (currentChunk.isNotEmpty) {
    try {
      String decodedString = utf8.decode(currentChunk);

      // Only add to list if decoded string is not empty
      if (decodedString.isNotEmpty) {
        decodedChunks.add(decodedString);
        // Print the final decoded chunk for debugging
        print('Final decoded chunk: $decodedString');
      } else {
        // Print if the decoded chunk is empty and not added
        print('Ignored empty last decoded chunk');
      }
    } catch (e) {
      // Handle invalid UTF-8 sequences without throwing
      print('Error decoding last chunk, skipping: $e');
    }
  }

  // Print the complete list of decoded chunks
  print('Decoded chunks: $decodedChunks');

  return decodedChunks;
}
