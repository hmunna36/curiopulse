"""Expose Kokoro's per-phoneme durations as an extra ONNX output named "duration".

kokoro-onnx reports phoneme timings (create_timed) only when the model has that
output; the stock v1.0 export does not, but the rounded durations already exist
inside the graph as /encoder/Clip_output_0.

Usage: python3 patch_kokoro.py <kokoro-v1.0.onnx> <kokoro-timed.onnx>
"""
import sys

import onnx
from onnx import TensorProto, helper

src, dst = sys.argv[1], sys.argv[2]
m = onnx.load(src)
m.graph.node.append(helper.make_node("Cast", ["/encoder/Clip_output_0"], ["duration"],
                                     to=TensorProto.INT64, name="expose_duration"))
m.graph.output.append(helper.make_tensor_value_info("duration", TensorProto.INT64, None))
onnx.save(m, dst)
print("wrote", dst)
